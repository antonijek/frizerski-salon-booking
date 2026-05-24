import { useState, useEffect } from "react";
import useAppointments from "./useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import salonConfig from "../config/salonConfig";
import serviceService from "../services/serviceService";
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
    });
    const [bookedTimes, setBookedTimes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [services, setServices] = useState([]);
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

    // Generisi radne sate
    const generateTimeSlots = () => {
        const slots = [];
        const [startH, startM] = workingHours.start.split(":").map(Number);
        const [endH, endM] = workingHours.end.split(":").map(Number);
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

    const timeSlots = generateTimeSlots();

    // Dohvati zauzete termine za izabrani datum (osim trenutnog)
    useEffect(() => {
        if (editForm.date && editingAppointment) {
            appointmentService
                .getByDate(editForm.date)
                .then((data) => {
                    const filtered = data
                        .filter((a) => a.id !== editingAppointment.id)
                        .map((a) => a.time.slice(0, 5));
                    setBookedTimes(filtered);
                })
                .catch(() => setBookedTimes([]));
        }
    }, [editForm.date, editingAppointment]);

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
