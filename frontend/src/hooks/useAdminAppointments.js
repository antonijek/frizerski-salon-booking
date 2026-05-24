import { useState, useEffect, useCallback } from "react";
import appointmentService from "../services/appointmentService";
import serviceService from "../services/serviceService";
import barberService from "../services/barberService";

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
            barber_id: app.barber_id || "",
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
