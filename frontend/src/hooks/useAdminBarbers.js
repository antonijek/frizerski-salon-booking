import { useState, useEffect, useCallback } from "react";
import barberService from "../services/barberService";

const useAdminBarbers = () => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingBarber, setEditingBarber] = useState(null);
    const [form, setForm] = useState({
        name: "",
        work_days: "1,2,3,4,5,6",
        work_start: "09:00",
        work_end: "17:00",
        is_active: true,
    });
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchBarbers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await barberService.getAll();
            setBarbers(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju frizera");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBarbers();
    }, [fetchBarbers]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const openCreateForm = () => {
        setEditingBarber(null);
        setForm({
            name: "",
            work_days: "1,2,3,4,5,6",
            work_start: "09:00",
            work_end: "17:00",
            is_active: true,
        });
        setShowForm(true);
    };

    const openEditForm = (barber) => {
        setEditingBarber(barber);
        setForm({
            name: barber.name,
            work_days: barber.work_days || "1,2,3,4,5,6",
            work_start: barber.work_start || "09:00",
            work_end: barber.work_end || "17:00",
            is_active: barber.is_active === 1 || barber.is_active === true,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBarber(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError("Ime frizera je obavezno");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const data = {
                name: form.name.trim(),
                work_days: form.work_days,
                work_start: form.work_start,
                work_end: form.work_end,
                is_active: form.is_active,
            };

            if (editingBarber) {
                await barberService.update(editingBarber.id, data);
                showSuccess("Frizer uspešno izmenjen");
            } else {
                await barberService.create(data);
                showSuccess("Frizer uspešno dodat");
            }
            closeForm();
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri čuvanju frizera");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (barber) => {
        try {
            await barberService.delete(barber.id);
            showSuccess("Frizer uspešno obrisan");
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri brisanju frizera");
        }
    };

    const handleToggleActive = async (barber) => {
        try {
            await barberService.update(barber.id, {
                is_active: !(
                    barber.is_active === 1 || barber.is_active === true
                ),
            });
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri promeni statusa");
        }
    };

    const clearError = () => setError("");

    return {
        barbers,
        loading,
        error,
        successMessage,
        showForm,
        editingBarber,
        form,
        setForm,
        saving,
        confirmDelete,
        openCreateForm,
        openEditForm,
        closeForm,
        handleChange,
        handleSubmit,
        handleDelete,
        setConfirmDelete,
        handleToggleActive,
        fetchBarbers,
        clearError,
    };
};

export default useAdminBarbers;
