import { useState, useEffect, useCallback } from "react";
import appointmentService from "../services/appointmentService";
import serviceService from "../services/serviceService";
import barberService from "../services/barberService";
import salonConfig from "../config/salonConfig";

const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const useAdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedBarber, setSelectedBarber] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
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
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [bookedTimes, setBookedTimes] = useState([]);

    const { workingHours } = salonConfig;

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju termina");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBarbers = useCallback(async () => {
        try {
            const data = await barberService.getAll();
            setBarbers(data);
        } catch (err) {
            console.error("Greška pri učitavanju frizera:", err);
        }
    }, []);

    const fetchServices = useCallback(async () => {
        try {
            const data = await serviceService.getAll();
            setServices(data);
        } catch (err) {
            console.error("Greška pri učitavanju usluga:", err);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchBarbers();
        fetchServices();
    }, [fetchAppointments, fetchBarbers, fetchServices]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleDelete = async (id) => {
        try {
            await appointmentService.delete(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            showSuccess("Termin uspešno obrisan");
        } catch (err) {
            setError(err.error || "Greška pri brisanju termina");
        }
    };

    const openEditForm = (app) => {
        setEditingAppointment(app);
        setEditForm({
            name: app.name,
            phone: app.phone,
            email: app.email || "",
            date: app.date,
            time: app.time,
            service: app.service,
            barber_id: app.barber_id || "", // Postavi trenutnog frizera ako postoji
        });
    };

    const closeEditForm = () => {
        setEditingAppointment(null);
        setError("");
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    // Generisi vremenske slotove
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
                return (
                    slotMinutes >= barberStart && slotEndMinutes <= barberEnd
                );
            });
        },
        [editForm.barber_id, editForm.service, barbers, services, workingHours],
    );

    const allTimeSlots = generateTimeSlots();
    const timeSlots = filterSlotsByBarber(allTimeSlots);

    // Dohvati zauzete termine za izabrani datum i frizera
    useEffect(() => {
        if (editForm.date) {
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
                            // Preskoči trenutni termin koji se edituje
                            if (
                                editingAppointment &&
                                a.id === editingAppointment.id
                            )
                                return;

                            const startTime = a.time.slice(0, 5);
                            const duration =
                                a.duration || workingHours.interval;
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
                    } else {
                        // Ako nije izabran frizer, blokiraj samo slotove gde su SVI frizeri zauzeti
                        const slotBookings = {};
                        data.forEach((a) => {
                            // Preskoči trenutni termin koji se edituje
                            if (
                                editingAppointment &&
                                a.id === editingAppointment.id
                            )
                                return;

                            const startTime = a.time.slice(0, 5);
                            const duration =
                                a.duration || workingHours.interval;
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
                        // Uzimamo u obzir samo frizere koji su aktivni i rade na taj dan i u to vreme
                        const dateStr = editForm.date;
                        const date = new Date(dateStr + "T00:00:00");
                        const dayOfWeek = date.getDay();
                        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                        Object.entries(slotBookings).forEach(
                            ([slot, bookedBarberIds]) => {
                                // Za svaki slot, uzmi u obzir samo frizere koji rade u to vreme
                                const slotMinutes = timeToMinutes(slot);
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
                                            const barberStart = timeToMinutes(
                                                b.work_start,
                                            );
                                            const barberEnd = timeToMinutes(
                                                b.work_end,
                                            );
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (
            !editForm.name.trim() ||
            !editForm.phone ||
            !editForm.date ||
            !editForm.time ||
            !editForm.service
        ) {
            setError("Sva polja su obavezna");
            return;
        }

        setSaving(true);
        setError("");
        try {
            await appointmentService.update(editingAppointment.id, {
                name: editForm.name.trim(),
                phone: editForm.phone,
                email: editForm.email,
                date: editForm.date,
                time: editForm.time,
                service: editForm.service,
                barber_id: editForm.barber_id || "",
            });
            showSuccess("Termin uspešno izmenjen");
            closeEditForm();
            fetchAppointments();
        } catch (err) {
            setError(err.error || "Greška pri izmeni termina");
        } finally {
            setSaving(false);
        }
    };

    // Filtrirani i sortirani termini
    const filteredAppointments = appointments
        .filter((app) => {
            const today = new Date().toISOString().split("T")[0];

            if (selectedDate) {
                return app.date === selectedDate;
            }

            switch (filter) {
                case "today":
                    return app.date === today;
                case "upcoming":
                    return app.date >= today;
                case "past":
                    return app.date < today;
                default:
                    return true;
            }
        })
        .filter((app) => {
            if (selectedBarber === "all") return true;
            return app.barber_id == selectedBarber;
        });

    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    const resetFilters = () => {
        setSelectedDate("");
        setSelectedBarber("all");
        setFilter("all");
    };

    const clearError = () => setError("");

    return {
        // State
        appointments: sortedAppointments,
        barbers,
        services,
        loading,
        error,
        successMessage,
        filter,
        selectedBarber,
        selectedDate,
        editingAppointment,
        editForm,
        saving,
        confirmDelete,
        timeSlots,
        bookedTimes,

        // Akcije
        setFilter,
        setSelectedBarber,
        setSelectedDate,
        fetchAppointments,
        setConfirmDelete,
        handleDelete,
        openEditForm,
        closeEditForm,
        handleEditChange,
        handleEditSubmit,
        resetFilters,
        clearError,
    };
};

export default useAdminAppointments;
