import { useState, useEffect } from "react";
import useAppointments from "./useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import salonConfig from "../config/salonConfig";
import serviceService from "../services/serviceService";
import barberService from "../services/barberService";
import appointmentService from "../services/appointmentService";

// ============================================
// useMyProfile - Hook za profil korisnika
// ============================================

const useMyProfile = () => {
    const { showNotification } = useAppContext();
    const { user, isAuthenticated } = useAuth();
    const { appointments, loading, error, fetchByPhone, update, remove } =
        useAppointments();
    const [phone, setPhone] = useState("");
    const [searched, setSearched] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        service: "",
        barber_id: "",
    });
    const [bookedTimes, setBookedTimes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const { workingHours } = salonConfig;

    // Automatski ucitaj termine ako je korisnik ulogovan
    useEffect(() => {
        if (isAuthenticated && user?.phone) {
            setPhone(user.phone);
            setSearched(true);
            fetchByPhone(user.phone);
        }
    }, [isAuthenticated, user?.phone]);

    // Ucitaj usluge iz baze
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await serviceService.getAll();
                setServices(data);
            } catch (err) {
                console.error("Greška pri učitavanju usluga:", err);
            }
        };
        fetchServices();
    }, []);

    // Ucitaj frizere iz baze
    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const data = await barberService.getAll();
                setBarbers(data);
            } catch (err) {
                console.error("Greška pri učitavanju frizera:", err);
            }
        };
        fetchBarbers();
    }, []);

    // Generisi radne sate
    const generateTimeSlots = () => {
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
    };

    // Filtriraj slotove po radnom vremenu izabranog frizera
    // Uzima u obzir i trajanje usluge - slot mora da stane u radno vreme
    const filterSlotsByBarber = (slots) => {
        const selectedBarberId = editForm.barber_id;
        if (!selectedBarberId) return slots;
        const barber = barbers.find((b) => b.id == selectedBarberId);
        if (!barber) return slots;

        const start = barber.work_start || workingHours.start;
        const end = barber.work_end || workingHours.end;
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const barberStart = startH * 60 + startM;
        const barberEnd = endH * 60 + endM;

        // Pronadji trajanje izabrane usluge
        const selectedService = services.find(
            (s) => s.name === editForm.service,
        );
        const serviceDuration =
            selectedService?.duration || workingHours.interval;

        return slots.filter((slot) => {
            const [h, m] = slot.split(":").map(Number);
            const slotMinutes = h * 60 + m;
            const slotEndMinutes = slotMinutes + serviceDuration;
            // Slot mora da pocne unutar radnog vremena i da se zavrsi pre kraja
            return slotMinutes >= barberStart && slotEndMinutes <= barberEnd;
        });
    };

    const allTimeSlots = generateTimeSlots();
    const timeSlots = filterSlotsByBarber(allTimeSlots);

    // Dohvati zauzete termine za izabrani datum (osim trenutnog)
    useEffect(() => {
        if (editForm.date && editingAppointment) {
            const fetchBookedTimes = async () => {
                try {
                    let data;
                    if (editForm.barber_id) {
                        data = await appointmentService.getByDateAndBarber(
                            editForm.date,
                            editForm.barber_id,
                        );
                    } else {
                        data = await appointmentService.getByDate(
                            editForm.date,
                        );
                    }

                    const blockedSlots = new Set();

                    if (editForm.barber_id) {
                        // Ako je izabran frizer, blokiraj sve njegove zauzete slotove
                        data.forEach((a) => {
                            if (
                                editingAppointment &&
                                a.id === editingAppointment.id
                            )
                                return;

                            const startTime = a.time.slice(0, 5);
                            const duration =
                                a.duration || workingHours.interval;
                            const [sH, sM] = startTime.split(":").map(Number);
                            const startMinutes = sH * 60 + sM;
                            const endMinutes = startMinutes + duration;
                            for (
                                let m = startMinutes;
                                m < endMinutes;
                                m += workingHours.interval
                            ) {
                                const h = Math.floor(m / 60);
                                const min = m % 60;
                                blockedSlots.add(
                                    `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
                                );
                            }
                        });
                    } else {
                        // Ako nije izabran frizer, blokiraj samo slotove gde su SVI frizeri zauzeti
                        const slotBookings = {};
                        data.forEach((a) => {
                            if (
                                editingAppointment &&
                                a.id === editingAppointment.id
                            )
                                return;

                            const startTime = a.time.slice(0, 5);
                            const duration =
                                a.duration || workingHours.interval;
                            const [sH, sM] = startTime.split(":").map(Number);
                            const startMinutes = sH * 60 + sM;
                            const endMinutes = startMinutes + duration;
                            for (
                                let m = startMinutes;
                                m < endMinutes;
                                m += workingHours.interval
                            ) {
                                const h = Math.floor(m / 60);
                                const min = m % 60;
                                const slot = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                                if (!slotBookings[slot]) {
                                    slotBookings[slot] = new Set();
                                }
                                slotBookings[slot].add(a.barber_id);
                            }
                        });

                        // Blokiraj samo slotove gde su SVI aktivni frizeri zauzeti
                        // Uzimamo u obzir samo frizere koji su aktivni i rade na taj dan i u to vreme
                        const dateStr = editForm.date;
                        const date = new Date(dateStr + "T00:00:00");
                        const dayOfWeek = date.getDay();
                        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                        Object.entries(slotBookings).forEach(
                            ([slot, bookedBarberIds]) => {
                                // Za svaki slot, uzmi u obzir samo frizere koji rade u to vreme
                                const [sH, sM] = slot.split(":").map(Number);
                                const slotMinutes = sH * 60 + sM;
                                const relevantBarberIds = barbers
                                    .filter((b) => {
                                        // Frizera racunamo samo ako je aktivan
                                        if (b.is_active !== 1) return false;
                                        // Proveri da li radi na ovaj dan
                                        if (b.work_days) {
                                            const workDays = b.work_days
                                                .split(",")
                                                .map((d) => d.trim());
                                            if (
                                                !workDays.includes(
                                                    dbDay.toString(),
                                                )
                                            )
                                                return false;
                                        }
                                        // Proveri da li radi u ovo vreme
                                        if (b.work_start && b.work_end) {
                                            const [wsH, wsM] = b.work_start
                                                .split(":")
                                                .map(Number);
                                            const [weH, weM] = b.work_end
                                                .split(":")
                                                .map(Number);
                                            const barberStart = wsH * 60 + wsM;
                                            const barberEnd = weH * 60 + weM;
                                            if (
                                                slotMinutes < barberStart ||
                                                slotMinutes >= barberEnd
                                            )
                                                return false;
                                        }
                                        return true;
                                    })
                                    .map((b) => b.id);

                                // Ako nema relevantnih frizera (niko ne radi u ovo vreme), blokiraj slot
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
                } catch {
                    setBookedTimes([]);
                }
            };
            fetchBookedTimes();
        }
    }, [
        editForm.date,
        editForm.barber_id,
        editingAppointment,
        barbers,
        workingHours.interval,
    ]);
    const handleSearch = (e) => {
        e.preventDefault();
        if (!phone.trim()) {
            showNotification("Unesite broj telefona", "error");
            return;
        }
        setSearched(true);
        fetchByPhone(phone.trim());
    };

    const handleDelete = async (id) => {
        const success = await remove(id);
        if (success) {
            showNotification("Termin uspešno obrisan", "success");
        } else {
            showNotification("Greška pri brisanju termina", "error");
        }
        setDeleteConfirmId(null);
    };

    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setEditForm({
            name: appointment.name,
            phone: appointment.phone,
            email: appointment.email || "",
            date: appointment.date,
            time: appointment.time.slice(0, 5),
            service: appointment.service,
            barber_id: appointment.barber_id || "",
        });
        setBookedTimes([]);
    };

    const closeEditModal = () => {
        setEditingAppointment(null);
        setEditForm({
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            service: "",
            barber_id: "",
        });
        setBookedTimes([]);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (
            !editForm.name.trim() ||
            !editForm.phone.trim() ||
            !editForm.date ||
            !editForm.time ||
            !editForm.service
        ) {
            showNotification("Sva polja su obavezna", "error");
            return;
        }

        setSaving(true);
        const result = await update(editingAppointment.id, editForm);
        setSaving(false);

        if (result.success) {
            showNotification("✅ Termin uspešno izmenjen!", "success");
            closeEditModal();
            fetchByPhone(phone);
        } else {
            showNotification(result.message, "error");
        }
    };

    const formatDate = (dateStr) => {
        try {
            if (!dateStr) return "Nepoznat datum";
            const parts = dateStr.split("-");
            if (parts.length !== 3) return dateStr;

            const date = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2]),
            );

            if (isNaN(date.getTime())) return dateStr;

            return date.toLocaleDateString("sr-RS", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const isPastAppointment = (dateStr, timeStr) => {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return false;
        const appointmentDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(timeStr.split(":")[0]),
            parseInt(timeStr.split(":")[1]),
        );
        return appointmentDate < new Date();
    };

    // Datum limiti za izmenu
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + salonConfig.booking.maxDaysAhead);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return {
        // State
        phone,
        setPhone,
        searched,
        appointments,
        loading,
        error,
        editingAppointment,
        editForm,
        bookedTimes,
        saving,
        services,
        barbers,
        timeSlots,
        minDate,
        maxDateStr,

        // Confirm dialog
        deleteConfirmId,
        setDeleteConfirmId,

        // Akcije
        handleSearch,
        handleDelete,
        openEditModal,
        closeEditModal,
        handleEditChange,
        handleEditSubmit,
        formatDate,
        isPastAppointment,
    };
};

export default useMyProfile;
