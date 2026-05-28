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
            barber_id: "",
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
    // Uzima u obzir i trajanje usluge - slot mora da stane u radno vreme
    const filterSlotsByBarber = useCallback(
        (slots) => {
            if (!selectedBarber) return slots;
            const start = selectedBarber.work_start || workingHours.start;
            const end = selectedBarber.work_end || workingHours.end;
            const [startH, startM] = start.split(":").map(Number);
            const [endH, endM] = end.split(":").map(Number);
            const barberStart = startH * 60 + startM;
            const barberEnd = endH * 60 + endM;

            // Pronadji trajanje izabrane usluge
            const selectedService = services.find(
                (s) => s.name === values.service,
            );
            const serviceDuration =
                selectedService?.duration || workingHours.interval;

            return slots.filter((slot) => {
                const [h, m] = slot.split(":").map(Number);
                const slotMinutes = h * 60 + m;
                const slotEndMinutes = slotMinutes + serviceDuration;
                // Slot mora da pocne unutar radnog vremena i da se zavrsi pre kraja
                return (
                    slotMinutes >= barberStart && slotEndMinutes <= barberEnd
                );
            });
        },
        [selectedBarber, workingHours, services, values.service],
    );

    // Filtriraj slotove koji su prosli za danasnji dan
    const filterPastSlots = useCallback(
        (slots) => {
            if (!values.date) return { slots, pastSlots: [] };

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            if (values.date !== todayStr) return { slots, pastSlots: [] }; // samo za danas

            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            // Dodajemo 30 minuta buffer-a da ostane vremena za pripremu
            const bufferMinutes = currentMinutes + 30;

            const pastSlots = [];
            const futureSlots = [];
            slots.forEach((slot) => {
                const [h, m] = slot.split(":").map(Number);
                const slotMinutes = h * 60 + m;
                if (slotMinutes < bufferMinutes) {
                    pastSlots.push(slot);
                } else {
                    futureSlots.push(slot);
                }
            });

            return { slots: futureSlots, pastSlots };
        },
        [values.date],
    );

    const allTimeSlots = generateTimeSlots();
    const { slots: filteredPastSlots, pastSlots: computedPastSlots } =
        filterPastSlots(allTimeSlots);
    const timeSlots = filterSlotsByBarber(filteredPastSlots);

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

    // Dohvati zauzete termine - izdvojeno u useCallback radi HMR podrske
    const fetchBookedTimes = useCallback(async () => {
        if (!values.date) return;
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

            if (values.barber_id) {
                // Ako je izabran frizer, blokiraj sve njegove zauzete slotove
                data.forEach((a) => {
                    const startTime = a.time?.slice(0, 5);
                    const duration = a.duration || workingHours.interval;
                    const startMinutes = timeToMinutes(startTime);
                    const endMinutes = startMinutes + duration;
                    for (
                        let m = startMinutes;
                        m < endMinutes;
                        m += workingHours.interval
                    ) {
                        const blockedTime = minutesToTime(m);
                        blockedSlots.add(blockedTime);
                    }
                });
            } else {
                // Ako nije izabran frizer, blokiraj samo slotove gde su SVI frizeri zauzeti
                const slotBookings = {};
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
                        const slot = minutesToTime(m);
                        if (!slotBookings[slot]) {
                            slotBookings[slot] = new Set();
                        }
                        slotBookings[slot].add(a.barber_id);
                    }
                });

                // Blokiraj samo slotove gde su SVI aktivni frizeri zauzeti
                const dateStr = values.date;
                const date = new Date(dateStr + "T00:00:00");
                const dayOfWeek = date.getDay();
                const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                Object.entries(slotBookings).forEach(
                    ([slot, bookedBarberIds]) => {
                        const slotMinutes = timeToMinutes(slot);
                        const relevantBarberIds = barbers
                            .filter((b) => {
                                if (b.is_active !== 1) return false;
                                if (b.work_days) {
                                    const workDays = b.work_days
                                        .split(",")
                                        .map((d) => d.trim());
                                    if (!workDays.includes(dbDay.toString()))
                                        return false;
                                }
                                if (b.work_start && b.work_end) {
                                    const barberStart = timeToMinutes(
                                        b.work_start,
                                    );
                                    const barberEnd = timeToMinutes(b.work_end);
                                    if (
                                        slotMinutes < barberStart ||
                                        slotMinutes >= barberEnd
                                    )
                                        return false;
                                }
                                return true;
                            })
                            .map((b) => b.id);

                        if (relevantBarberIds.length === 0) {
                            blockedSlots.add(slot);
                            return;
                        }

                        const allBusy = relevantBarberIds.every((id) =>
                            bookedBarberIds.has(id),
                        );
                        if (allBusy) {
                            blockedSlots.add(slot);
                        }
                    },
                );
            }

            setBookedTimes([...blockedSlots]);
        } catch (err) {
            console.error("Greška pri dohvatanju zauzetih termina:", err);
            setBookedTimes([]);
        }
    }, [
        values.date,
        values.barber_id,
        barbers,
        workingHours.interval,
        setBookedTimes,
    ]);

    useEffect(() => {
        if (values.date) {
            fetchBookedTimes();
        }
    }, [values.date, fetchBookedTimes]);

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

        // Ako nije izabran frizer, posalji null umesto praznog stringa
        const submitData = {
            ...values,
            barber_id: values.barber_id || null,
        };

        try {
            const result = await create(submitData);

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

    // Datum limiti - dozvoli zakazivanje od danas (lokalno vreme, ne UTC)
    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + booking.maxDaysAhead);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

    // Inicijalizuj date na danas ako nije postavljen
    useEffect(() => {
        if (!values.date) {
            handleChange({ target: { name: "date", value: minDate } });
        }
    }, []);

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
        pastSlots: computedPastSlots,
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
