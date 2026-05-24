import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const useAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        is_admin: false,
    });
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju korisnika");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const openEditForm = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            is_admin: user.is_admin === 1 || user.is_admin === true,
        });
    };

    const closeEditForm = () => {
        setEditingUser(null);
        setError("");
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editForm.name.trim() || !editForm.email.trim()) {
            setError("Ime i email su obavezni");
            return;
        }

        setSaving(true);
        setError("");
        try {
            await authService.updateUser(editingUser.id, {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone,
                is_admin: editForm.is_admin,
            });
            showSuccess("Korisnik uspešno izmenjen");
            closeEditForm();
            fetchUsers();
        } catch (err) {
            setError(err.error || "Greška pri izmeni korisnika");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        try {
            await authService.deleteUser(user.id);
            showSuccess("Korisnik uspešno obrisan");
            fetchUsers();
        } catch (err) {
            setError(err.error || "Greška pri brisanju korisnika");
        }
    };

    const clearError = () => setError("");

    return {
        users,
        loading,
        error,
        successMessage,
        editingUser,
        editForm,
        saving,
        confirmDelete,
        openEditForm,
        closeEditForm,
        handleEditChange,
        handleEditSubmit,
        handleDelete,
        setConfirmDelete,
        fetchUsers,
        clearError,
    };
};

export default useAdminUsers;
