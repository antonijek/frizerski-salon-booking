import { useState, useEffect, useCallback } from "react";
import useForm from "./useForm";
import useAppointments from "./useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import serviceService from "../services/serviceService";
import appointmentService from "../services/appointmentService";
import barberService from "../services/barberService";
import salonConfig from "../config/salonConfig";

// ============================================
// useBookingForm - Hook za formu zakazivanja
// ============================================

const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const useBookingForm = () => {
    const { showNotification } = useAppContext();
    const { create } = useAppointments();
    const { user, isAuthenticated } = useAuth();
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProfilePrompt, setShowProfilePrompt] = useState(false);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);

    const { workingHours, booking } = salonConfig;

    const validationRules = {
        name: [
            { required: true, message: "Ime i prezime je obavezno" },
            { minLength: 3, message: "Ime mora imati najmanje 3 karaktera" },
        ],
        phone: [
            { required: true, message: "Broj telefona je obavezan" },
            {
                pattern: /^[\d\s/+\-()]{6,}$/,
                message: "Unesite ispravan broj telefona",
            },
        ],
        date: [{ required: true, message: "Datum je obavezan" }],
        time: [{ required: true, message: "Vreme je obavezno" }],
        service: [{ required: true, message: "Usluga je obavezna" }],
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
    } = useForm(
        {
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            service: "",
        },
        validationRules,
    );

    // Ucitaj usluge i frizere iz baze
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesData, barbersData] = await Promise.all([
                    serviceService.getAll(),
                    barberService.getAll(),
                ]);
                setServices(servicesData);
                setBarbers(barbersData);
            } catch (err) {
                console.error("Greška pri učitavanju podataka:", err);
            }
        };
        fetchData();
    }, []);

    // Popuni formu podacima ulogovanog korisnika
    useEffect(() => {
        if (isAuthenticated && user) {
            const fields = [
                { name: "name", value: user.name || "" },
                { name: "phone", value: user.phone || "" },
                { name: "email", value: user.email || "" },
            ];
            fields.forEach((field) => {
                handleChange({ target: field });
            });
        }
    }, [isAuthenticated, user]);

    // Pronadji izabranog frizera
    const selectedBarber = values.barber_id
        ? barbers.find((b) => b.id === parseInt(values.barber_id))
        : null;

    // Generisi radne sate
    const generateTimeSlots = useCallback(() => {
        let earliestStart = workingHours.start;
        let latestEnd = workingHours.end;
        if (barbers.length > 0) {
            barbers.forEach((b) => {
                if (b.work_start && b.work_start < earliestStart)
                    earliestStart = b.work_start;
                if (b.work_end && b.work_end > latestEnd)
                    latestEnd = b.work_end;
            });
        }

        const slots = [];
        const [startH, startM] = earliestStart.split(":").map(Number);
        const [endH, endM] = latestEnd.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        for (let m = startMinutes; m < endMinutes; m += workingHours.interval) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            slots.push(
                `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
            );
        }
        return slots;
    }, [barbers, workingHours]);

    // Filtriraj slotove po radnom vremenu izabranog frizera
    const filterSlotsByBarber = useCallback(
        (slots) => {
            if (!selectedBarber) return slots;
            const start = selectedBarber.work_start || workingHours.start;
            const end = selectedBarber.work_end || workingHours.end;
            const [startH, startM] = start.split(":").map(Number);
            const [endH, endM] = end.split(":").map(Number);
            const barberStart = startH * 60 + startM;
            const barberEnd = endH * 60 + endM;

            return slots.filter((slot) => {
                const [h, m] = slot.split(":").map(Number);
                const slotMinutes = h * 60 + m;
                return slotMinutes >= barberStart && slotMinutes < barberEnd;
            });
        },
        [selectedBarber, workingHours],
    );

    const allTimeSlots = generateTimeSlots();
    const timeSlots = filterSlotsByBarber(allTimeSlots);

    // Proveri da li je datum radni dan za izabranog frizera
    // Ako nije izabran konkretan frizer, proveri da li iko radi na taj dan
    const isDateAvailable = useCallback(
        (dateStr) => {
            if (!dateStr) return true;
            const date = new Date(dateStr + "T00:00:00");
            const dayOfWeek = date.getDay();
            const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

            if (selectedBarber) {
                // Proveri za konkretnog frizera
                if (selectedBarber?.work_days) {
                    const workDays = selectedBarber.work_days
                        .split(",")
                        .map((d) => d.trim());
                    return workDays.includes(dbDay.toString());
                }
                return true;
            }

            // Nije izabran konkretan frizer - proveri da li iko radi na taj dan
            if (barbers.length > 0) {
                return barbers.some((barber) => {
                    if (barber?.work_days) {
                        const workDays = barber.work_days
                            .split(",")
                            .map((d) => d.trim());
                        return workDays.includes(dbDay.toString());
                    }
                    return true;
                });
            }

            return true;
        },
        [selectedBarber, barbers],
    );

    // Dohvati zauzete termine
    useEffect(() => {
        if (values.date) {
            const fetchBookedTimes = async () => {
                try {
                    let data;
                    if (values.barber_id) {
                        data = await appointmentService.getByDateAndBarber(
                            values.date,
                            values.barber_id,
                        );
                    } else {
                        data = await appointmentService.getByDate(values.date);
                    }

                    const blockedSlots = new Set();
                    data.forEach((a) => {
                        const startTime = a.time.slice(0, 5);
                        const duration = a.duration || workingHours.interval;
                        const startMinutes = timeToMinutes(startTime);
                        const endMinutes = startMinutes + duration;
                        for (
                            let m = startMinutes;
                            m < endMinutes;
                            m += workingHours.interval
                        ) {
                            blockedSlots.add(minutesToTime(m));
                        }
                    });
                    setBookedTimes([...blockedSlots]);
                } catch {
                    setBookedTimes([]);
                }
            };
            fetchBookedTimes();
        }
    }, [values.date, values.barber_id, workingHours.interval]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) return;

        // Proveri da li izabrani frizer (ili bilo koji) radi na izabrani datum
        if (values.date && !isDateAvailable(values.date)) {
            const poruka = selectedBarber
                ? "Izabrani frizer ne radi na ovaj dan. Izaberite drugi datum ili drugog frizera."
                : "Nijedan frizer ne radi na ovaj dan. Izaberite drugi datum.";
            showNotification(poruka, "error");
            return;
        }

        setLoading(true);

        try {
            const result = await create(values);

            if (result.success) {
                showNotification("🎉 Termin uspešno zakazan!", "success");
                setShowProfilePrompt(true);
                reset();
                setBookedTimes([]);
            } else {
                showNotification(result.message, "error");
            }
        } catch {
            showNotification("Greška pri povezivanju sa serverom", "error");
        } finally {
            setLoading(false);
        }
    };

    // Datum limiti
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + booking.maxDaysAhead);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return {
        // State
        values,
        errors,
        touched,
        services,
        barbers,
        selectedBarber,
        timeSlots,
        bookedTimes,
        loading,
        showProfilePrompt,
        minDate,
        maxDateStr,

        // Akcije
        handleChange,
        handleBlur,
        handleSubmit,
        isDateAvailable,
        setShowProfilePrompt,
    };
};

export default useBookingForm;
