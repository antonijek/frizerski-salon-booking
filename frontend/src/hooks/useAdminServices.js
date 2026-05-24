import { useState, useEffect, useCallback } from "react";
import serviceService from "../services/serviceService";

const useAdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [form, setForm] = useState({
        name: "",
        duration: "",
        price: "",
        description: "",
        icon: "✂️",
    });
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await serviceService.getAll();
            setServices(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju usluga");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const openCreateForm = () => {
        setEditingService(null);
        setForm({
            name: "",
            duration: "",
            price: "",
            description: "",
            icon: "✂️",
        });
        setShowForm(true);
    };

    const openEditForm = (service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            duration: service.duration.toString(),
            price: service.price.toString(),
            description: service.description || "",
            icon: service.icon || "✂️",
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingService(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.duration || !form.price) {
            setError("Ime, trajanje i cena su obavezni");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const data = {
                name: form.name.trim(),
                duration: parseInt(form.duration),
                price: parseFloat(form.price),
                description: form.description.trim(),
                icon: form.icon || "✂️",
            };

            if (editingService) {
                await serviceService.update(editingService.id, data);
                showSuccess("Usluga uspešno izmenjena");
            } else {
                await serviceService.create(data);
                showSuccess("Usluga uspešno dodata");
            }
            closeForm();
            fetchServices();
        } catch (err) {
            setError(err.error || "Greška pri čuvanju usluge");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service) => {
        try {
            await serviceService.delete(service.id);
            showSuccess("Usluga uspešno obrisana");
            fetchServices();
        } catch (err) {
            setError(err.error || "Greška pri brisanju usluge");
        }
    };

    const clearError = () => setError("");

    return {
        services,
        loading,
        error,
        successMessage,
        showForm,
        editingService,
        form,
        saving,
        confirmDelete,
        openCreateForm,
        openEditForm,
        closeForm,
        handleChange,
        handleSubmit,
        handleDelete,
        setConfirmDelete,
        fetchServices,
        clearError,
    };
};

export default useAdminServices;
