import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";
import serviceService from "../services/serviceService";

// ============================================
// AdminPanel - Administratorski panel
// ============================================

const AdminPanel = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("appointments");

    // Proveri da li je korisnik admin
    useEffect(() => {
        if (!user?.isAdmin) {
            onNavigate("/");
        }
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 text-sm">Upravljanje salonom</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{user?.name}</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                        Odjavi se
                    </button>
                </div>
            </div>

            {/* Tabovi */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab("appointments")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "appointments"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    📅 Termini
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "services"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    ✂️ Usluge
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "stats"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    📊 Statistika
                </button>
            </div>

            {/* Sadržaj tabova */}
            {activeTab === "appointments" && (
                <AppointmentsTab appointmentService={appointmentService} />
            )}
            {activeTab === "services" && (
                <ServicesTab serviceService={serviceService} />
            )}
            {activeTab === "stats" && (
                <StatsTab appointmentService={appointmentService} />
            )}
        </div>
    );
};

// ============================================
// AppointmentsTab - Upravljanje terminima
// ============================================
const AppointmentsTab = ({ appointmentService }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
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
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Da li ste sigurni da želite da obrišete ovaj termin?",
            )
        ) {
            return;
        }

        try {
            await appointmentService.delete(id);
            setAppointments(appointments.filter((a) => a.id !== id));
            setSuccessMessage("Termin uspešno obrisan");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.error || "Greška pri brisanju termina");
        }
    };

    const filteredAppointments = appointments.filter((app) => {
        const today = new Date().toISOString().split("T")[0];
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
    });

    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje termina...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {successMessage}
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { key: "all", label: "Svi termini" },
                    { key: "today", label: "Danas" },
                    { key: "upcoming", label: "Predstojeći" },
                    { key: "past", label: "Prošli" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === f.key
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
                <button
                    onClick={fetchAppointments}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm ml-auto"
                    title="Osveži"
                >
                    🔄 Osveži
                </button>
            </div>

            {sortedAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-gray-500">Nema termina</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Ime
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Telefon
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Datum
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Vreme
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Usluga
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                                        Akcija
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedAppointments.map((app) => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            {app.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.phone}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.email || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.time}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.service}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() =>
                                                    handleDelete(app.id)
                                                }
                                                className="text-red-500 hover:text-red-700 transition text-sm"
                                                title="Obriši termin"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 border-t">
                        Ukupno: {sortedAppointments.length} termina
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================
// ServicesTab - Upravljanje uslugama
// ============================================
const ServicesTab = ({ serviceService }) => {
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

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
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
                setSuccessMessage("Usluga uspešno izmenjena");
            } else {
                await serviceService.create(data);
                setSuccessMessage("Usluga uspešno kreirana");
            }

            setTimeout(() => setSuccessMessage(""), 3000);
            closeForm();
            fetchServices();
        } catch (err) {
            console.error("Greška pri čuvanju usluge:", err);
            setError(err?.error || err?.message || "Greška pri čuvanju usluge");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (
            !window.confirm(
                `Da li ste sigurni da želite da obrišete uslugu "${name}"?`,
            )
        ) {
            return;
        }

        try {
            await serviceService.delete(id);
            setSuccessMessage("Usluga uspešno obrisana");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchServices();
        } catch (err) {
            setError(err.error || "Greška pri brisanju usluge");
        }
    };

    const iconOptions = [
        "✂️",
        "💇",
        "🎨",
        "✨",
        "🌟",
        "💨",
        "🔧",
        "🧔",
        "💈",
        "🪒",
        "🧴",
        "💆",
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje usluga...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {successMessage}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 text-sm">
                    {services.length} usluga
                </p>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
                >
                    ➕ Dodaj uslugu
                </button>
            </div>

            {/* Forma za dodavanje/izmenu */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingService
                                    ? "Izmeni uslugu"
                                    : "Nova usluga"}
                            </h3>
                            <button
                                onClick={closeForm}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Ikonica */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ikonica
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    icon,
                                                }))
                                            }
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition ${
                                                form.icon === icon
                                                    ? "bg-amber-600 text-white ring-2 ring-amber-300"
                                                    : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ime usluge */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Naziv usluge *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="npr. Šišanje"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Trajanje */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trajanje (minuti) *
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    min="5"
                                    max="480"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Cena */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cena (€) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Opis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Opis (opciono)
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Kratak opis usluge..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Dugmad */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Odustani
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving
                                        ? "Čuvanje..."
                                        : editingService
                                          ? "Sačuvaj izmene"
                                          : "Dodaj uslugu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista usluga */}
            {services.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <div className="text-5xl mb-4">✂️</div>
                    <p className="text-gray-500">Nema usluga</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">
                                    {service.icon || "✂️"}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        {service.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {service.description && (
                                            <span>
                                                {service.description} ·{" "}
                                            </span>
                                        )}
                                        ⏱ {service.duration}min · 💰{" "}
                                        {parseFloat(service.price).toFixed(2)}€
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditForm(service)}
                                    className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-sm"
                                >
                                    ✏️ Izmeni
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(service.id, service.name)
                                    }
                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                                >
                                    🗑️ Obriši
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// StatsTab - Statistika
// ============================================
const StatsTab = ({ appointmentService }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [period, setPeriod] = useState("all"); // 'all' | 'month' | 'week'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju podataka");
        } finally {
            setLoading(false);
        }
    };

    // Filtriranje po periodu
    const now = new Date();
    const filteredAppointments = appointments.filter((app) => {
        const appDate = new Date(app.date + "T00:00:00");
        switch (period) {
            case "week": {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return appDate >= weekAgo;
            }
            case "month": {
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return appDate >= monthAgo;
            }
            default:
                return true;
        }
    });

    // Statistika
    const totalAppointments = filteredAppointments.length;
    const totalRevenue = filteredAppointments.reduce((sum, app) => {
        return sum + (parseFloat(app.price) || 0);
    }, 0);

    // Najtraženije usluge
    const serviceCounts = {};
    filteredAppointments.forEach((app) => {
        serviceCounts[app.service] = (serviceCounts[app.service] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Termini po danima
    const dayCounts = {};
    filteredAppointments.forEach((app) => {
        dayCounts[app.date] = (dayCounts[app.date] || 0) + 1;
    });
    const topDays = Object.entries(dayCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

    // Današnji termini
    const today = now.toISOString().split("T")[0];
    const todayAppointments = appointments.filter((a) => a.date === today);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje statistike...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* Filter perioda */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: "all", label: "Sve vreme" },
                    { key: "month", label: "Poslednjih mesec dana" },
                    { key: "week", label: "Poslednjih 7 dana" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setPeriod(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            period === f.key
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Kartice sa statistikom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-2xl font-bold text-gray-800">
                        {totalAppointments}
                    </p>
                    <p className="text-sm text-gray-500">Ukupno termina</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-2xl font-bold text-gray-800">
                        {todayAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Današnjih termina</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="text-2xl font-bold text-gray-800">
                        {topServices.length > 0 ? topServices[0][0] : "-"}
                    </p>
                    <p className="text-sm text-gray-500">Najtraženija usluga</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl mb-2">👤</div>
                    <p className="text-2xl font-bold text-gray-800">
                        {new Set(filteredAppointments.map((a) => a.phone)).size}
                    </p>
                    <p className="text-sm text-gray-500">Broj klijenata</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-2xl font-bold text-green-600">
                        {totalRevenue.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">Ukupna zarada</p>
                </div>
            </div>

            {/* Najtraženije usluge */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ⭐ Najtraženije usluge
                </h3>
                {topServices.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nema podataka</p>
                ) : (
                    <div className="space-y-3">
                        {topServices.map(([service, count], index) => {
                            const maxCount = topServices[0][1];
                            const percentage =
                                maxCount > 0
                                    ? Math.round((count / maxCount) * 100)
                                    : 0;
                            return (
                                <div key={service}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">
                                            {index + 1}. {service}
                                        </span>
                                        <span className="text-gray-500 font-medium">
                                            {count} termina
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Najprometniji dani */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    📅 Najprometniji dani
                </h3>
                {topDays.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nema podataka</p>
                ) : (
                    <div className="space-y-3">
                        {topDays.map(([date, count], index) => {
                            const maxCount = topDays[0][1];
                            const percentage =
                                maxCount > 0
                                    ? Math.round((count / maxCount) * 100)
                                    : 0;
                            return (
                                <div key={date}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">
                                            {index + 1}. {date}
                                        </span>
                                        <span className="text-gray-500 font-medium">
                                            {count} termina
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
