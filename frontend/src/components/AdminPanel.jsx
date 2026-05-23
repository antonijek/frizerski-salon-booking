import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";
import serviceService from "../services/serviceService";
import barberService from "../services/barberService";
import authService from "../services/authService";

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
                    onClick={() => setActiveTab("barbers")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "barbers"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    🧔 Frizeri
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "users"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    👥 Korisnici
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
            {activeTab === "barbers" && (
                <BarbersTab barberService={barberService} />
            )}
            {activeTab === "users" && <UsersTab />}
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
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedBarber, setSelectedBarber] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
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
    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAppointments();
        fetchBarbers();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await serviceService.getAll();
            setServices(data);
        } catch (err) {
            console.error("Greška pri učitavanju usluga:", err);
        }
    };

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

    const fetchBarbers = async () => {
        try {
            const data = await barberService.getAll();
            setBarbers(data);
        } catch (err) {
            console.error("Greška pri učitavanju frizera:", err);
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
            setSuccessMessage("Termin uspešno izmenjen");
            setTimeout(() => setSuccessMessage(""), 3000);
            closeEditForm();
            fetchAppointments();
        } catch (err) {
            setError(err.error || "Greška pri izmeni termina");
        } finally {
            setSaving(false);
        }
    };

    const filteredAppointments = appointments
        .filter((app) => {
            const today = new Date().toISOString().split("T")[0];

            // Filter po datumu
            if (selectedDate) {
                return app.date === selectedDate;
            }

            // Filter po tipu
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
            // Filter po frizeru
            if (selectedBarber === "all") return true;
            return app.barber_id == selectedBarber;
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

            {/* Filteri */}
            <div className="flex flex-wrap gap-2 mb-4">
                {[
                    { key: "all", label: "Svi termini" },
                    { key: "today", label: "Danas" },
                    { key: "upcoming", label: "Predstojeći" },
                    { key: "past", label: "Prošli" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => {
                            setFilter(f.key);
                            setSelectedDate("");
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === f.key && !selectedDate
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-6 items-end">
                {/* Filter po datumu */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Datum
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            if (e.target.value) setFilter("all");
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Filter po frizeru */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Frizer
                    </label>
                    <select
                        value={selectedBarber}
                        onChange={(e) => setSelectedBarber(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    >
                        <option value="all">Svi frizeri</option>
                        {barbers.map((barber) => (
                            <option key={barber.id} value={barber.id}>
                                {barber.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={fetchAppointments}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    title="Osveži"
                >
                    🔄 Osveži
                </button>

                {(selectedDate !== "" || selectedBarber !== "all") && (
                    <button
                        onClick={() => {
                            setSelectedDate("");
                            setSelectedBarber("all");
                            setFilter("all");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                        ✕ Poništi filtere
                    </button>
                )}
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
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Frizer
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
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.barber_name ? (
                                                <span>
                                                    🧔 {app.barber_name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() =>
                                                        openEditForm(app)
                                                    }
                                                    className="text-amber-600 hover:text-amber-800 transition text-sm"
                                                    title="Izmeni termin"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(app.id)
                                                    }
                                                    className="text-red-500 hover:text-red-700 transition text-sm"
                                                    title="Obriši termin"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
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

            {/* Modal za izmenu termina */}
            {editingAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Izmeni termin
                            </h3>
                            <button
                                onClick={closeEditForm}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ime i prezime *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    placeholder="npr. Petar Petrović"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon *
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    placeholder="npr. 067551384"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (opciono)
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    placeholder="npr. petar@email.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Datum *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editForm.date}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vreme *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={editForm.time}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usluga *
                                </label>
                                <select
                                    name="service"
                                    value={editForm.service}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Izaberi uslugu</option>
                                    {services.map((s) => (
                                        <option key={s.name} value={s.name}>
                                            {s.icon || "✂️"} {s.name} -{" "}
                                            {parseFloat(s.price).toFixed(2)}€
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEditForm}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Odustani
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================
// UsersTab - Pregled registrovanih korisnika
// ============================================
const UsersTab = () => {
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
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
            setSuccessMessage("Korisnik uspešno izmenjen");
            setTimeout(() => setSuccessMessage(""), 3000);
            closeEditForm();
            fetchUsers();
        } catch (err) {
            setError(err.error || "Greška pri izmeni korisnika");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (
            !window.confirm(
                `Da li ste sigurni da želite da obrišete korisnika "${user.name}" (${user.email})?`,
            )
        ) {
            return;
        }

        try {
            await authService.deleteUser(user.id);
            setSuccessMessage("Korisnik uspešno obrisan");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchUsers();
        } catch (err) {
            setError(err.error || "Greška pri brisanju korisnika");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje korisnika...</p>
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
                    {users.length} registrovanih korisnika
                </p>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                    🔄 Osveži
                </button>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <div className="text-5xl mb-4">👥</div>
                    <p className="text-gray-500">
                        Nema registrovanih korisnika
                    </p>
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
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Telefon
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Uloga
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Datum registracije
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                                        Akcija
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {user.phone || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {user.is_admin ? (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                    Korisnik
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString("sr-RS", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() =>
                                                        openEditForm(user)
                                                    }
                                                    className="text-amber-600 hover:text-amber-800 transition text-sm"
                                                    title="Izmeni korisnika"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                    className="text-red-500 hover:text-red-700 transition text-sm"
                                                    title="Obriši korisnika"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal za izmenu korisnika */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Izmeni korisnika
                            </h3>
                            <button
                                onClick={closeEditForm}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ime *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="is_admin"
                                    id="is_admin"
                                    checked={editForm.is_admin}
                                    onChange={handleEditChange}
                                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <label
                                    htmlFor="is_admin"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Admin korisnik
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEditForm}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Odustani
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                                </button>
                            </div>
                        </form>
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
                setSuccessMessage("Usluga uspešno dodata");
            }
            setTimeout(() => setSuccessMessage(""), 3000);
            closeForm();
            fetchServices();
        } catch (err) {
            setError(err.error || "Greška pri čuvanju usluge");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service) => {
        if (
            !window.confirm(
                `Da li ste sigurni da želite da obrišete uslugu "${service.name}"?`,
            )
        ) {
            return;
        }

        try {
            await serviceService.delete(service.id);
            setSuccessMessage("Usluga uspešno obrisana");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchServices();
        } catch (err) {
            setError(err.error || "Greška pri brisanju usluge");
        }
    };

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
                    + Dodaj uslugu
                </button>
            </div>

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
                            className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">
                                    {service.icon || "✂️"}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {service.duration} min
                                    </p>
                                    {service.description && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-amber-600">
                                    {parseFloat(service.price).toFixed(2)}€
                                </span>
                                <button
                                    onClick={() => openEditForm(service)}
                                    className="text-amber-600 hover:text-amber-800 transition"
                                    title="Izmeni uslugu"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(service)}
                                    className="text-red-500 hover:text-red-700 transition"
                                    title="Obriši uslugu"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal za dodavanje/izmenu usluge */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingService
                                    ? "Izmeni uslugu"
                                    : "Dodaj uslugu"}
                            </h3>
                            <button
                                onClick={closeForm}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ikona
                                </label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={form.icon}
                                    onChange={handleChange}
                                    placeholder="✂️"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trajanje (min) *
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        placeholder="30"
                                        min="5"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cena (€) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="15"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Opis (opciono)
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Kratak opis usluge..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

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
        </div>
    );
};

// ============================================
// BarbersTab - Upravljanje frizerima
// ============================================
const BarbersTab = ({ barberService }) => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingBarber, setEditingBarber] = useState(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        work_start: "08:00",
        work_end: "16:00",
        work_days: [],
        active: true,
    });
    const [saving, setSaving] = useState(false);

    const DAYS = [
        { value: "1", label: "Pon" },
        { value: "2", label: "Uto" },
        { value: "3", label: "Sri" },
        { value: "4", label: "Čet" },
        { value: "5", label: "Pet" },
        { value: "6", label: "Sub" },
        { value: "7", label: "Ned" },
    ];

    useEffect(() => {
        fetchBarbers();
    }, []);

    const fetchBarbers = async () => {
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
    };

    const openCreateForm = () => {
        setEditingBarber(null);
        setForm({
            name: "",
            phone: "",
            email: "",
            work_start: "08:00",
            work_end: "16:00",
            work_days: [],
            active: true,
        });
        setShowForm(true);
    };

    const openEditForm = (barber) => {
        setEditingBarber(barber);
        setForm({
            name: barber.name,
            phone: barber.phone || "",
            email: barber.email || "",
            work_start: barber.work_start || "08:00",
            work_end: barber.work_end || "16:00",
            work_days: barber.work_days
                ? barber.work_days.split(",").map((d) => d.trim())
                : [],
            active: barber.active === 1 || barber.active === true,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBarber(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setForm((prev) => ({
            ...prev,
            work_days: prev.work_days.includes(day)
                ? prev.work_days.filter((d) => d !== day)
                : [...prev.work_days, day],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError("Ime frizera je obavezno");
            return;
        }

        if (form.work_days.length === 0) {
            setError("Izaberite bar jedan radni dan");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const data = {
                name: form.name.trim(),
                phone: form.phone,
                email: form.email,
                work_start: form.work_start,
                work_end: form.work_end,
                work_days: form.work_days.join(","),
                active: form.active,
            };

            if (editingBarber) {
                await barberService.update(editingBarber.id, data);
                setSuccessMessage("Frizer uspešno izmenjen");
            } else {
                await barberService.create(data);
                setSuccessMessage("Frizer uspešno dodat");
            }
            setTimeout(() => setSuccessMessage(""), 3000);
            closeForm();
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri čuvanju frizera");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (barber) => {
        if (
            !window.confirm(
                `Da li ste sigurni da želite da obrišete frizera "${barber.name}"?`,
            )
        ) {
            return;
        }

        try {
            await barberService.delete(barber.id);
            setSuccessMessage("Frizer uspešno obrisan");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri brisanju frizera");
        }
    };

    const handleToggleActive = async (barber) => {
        try {
            await barberService.update(barber.id, {
                ...barber,
                active: !barber.active,
            });
            setSuccessMessage(
                `Frizer ${barber.active ? "deaktiviran" : "aktiviran"}`,
            );
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchBarbers();
        } catch (err) {
            setError(err.error || "Greška pri izmeni statusa frizera");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje frizera...</p>
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
                    {barbers.length} frizera
                </p>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
                >
                    + Dodaj frizera
                </button>
            </div>

            {barbers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <div className="text-5xl mb-4">🧔</div>
                    <p className="text-gray-500">Nema frizera</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {barbers.map((barber) => (
                        <div
                            key={barber.id}
                            className={`bg-white rounded-xl shadow-sm p-6 ${
                                !barber.active ? "opacity-60" : ""
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">🧔</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-800">
                                                {barber.name}
                                            </h3>
                                            {!barber.active && (
                                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                    Neaktivan
                                                </span>
                                            )}
                                        </div>
                                        {barber.phone && (
                                            <p className="text-sm text-gray-500">
                                                📞 {barber.phone}
                                            </p>
                                        )}
                                        {barber.email && (
                                            <p className="text-sm text-gray-500">
                                                ✉️ {barber.email}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">
                                            🕐 {barber.work_start || "08:00"} -{" "}
                                            {barber.work_end || "16:00"}
                                        </p>
                                        {barber.work_days && (
                                            <div className="flex gap-1 mt-1">
                                                {DAYS.map((day) => (
                                                    <span
                                                        key={day.value}
                                                        className={`text-xs px-1.5 py-0.5 rounded ${
                                                            barber.work_days.includes(
                                                                day.value,
                                                            )
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-gray-100 text-gray-400"
                                                        }`}
                                                    >
                                                        {day.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            handleToggleActive(barber)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                            barber.active
                                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                        }`}
                                        title={
                                            barber.active
                                                ? "Deaktiviraj frizera"
                                                : "Aktiviraj frizera"
                                        }
                                    >
                                        {barber.active ? "❌" : "✅"}
                                    </button>
                                    <button
                                        onClick={() => openEditForm(barber)}
                                        className="text-amber-600 hover:text-amber-800 transition"
                                        title="Izmeni frizera"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(barber)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Obriši frizera"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal za dodavanje/izmenu frizera */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingBarber
                                    ? "Izmeni frizera"
                                    : "Dodaj frizera"}
                            </h3>
                            <button
                                onClick={closeForm}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ime i prezime *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="npr. Marko Marković"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="npr. 067551384"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="npr. marko@email.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Početak radnog vremena
                                    </label>
                                    <input
                                        type="time"
                                        name="work_start"
                                        value={form.work_start}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kraj radnog vremena
                                    </label>
                                    <input
                                        type="time"
                                        name="work_end"
                                        value={form.work_end}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Radni dani *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() =>
                                                handleDayToggle(day.value)
                                            }
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                                form.work_days.includes(
                                                    day.value,
                                                )
                                                    ? "bg-amber-600 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="active"
                                    id="active"
                                    checked={form.active}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            active: e.target.checked,
                                        }))
                                    }
                                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <label
                                    htmlFor="active"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Aktivan
                                </label>
                            </div>

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
                                        : editingBarber
                                          ? "Sačuvaj izmene"
                                          : "Dodaj frizera"}
                                </button>
                            </div>
                        </form>
                    </div>
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

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter((a) => a.date === today);
    const upcomingAppointments = appointments.filter((a) => a.date >= today);
    const totalEarnings = appointments.reduce((sum, a) => {
        return sum + (parseFloat(a.price) || 0);
    }, 0);

    // Statistika po uslugama
    const serviceStats = {};
    appointments.forEach((a) => {
        if (!serviceStats[a.service]) {
            serviceStats[a.service] = { count: 0, total: 0 };
        }
        serviceStats[a.service].count++;
        serviceStats[a.service].total += parseFloat(a.price) || 0;
    });

    // Statistika po frizerima
    const barberStats = {};
    appointments.forEach((a) => {
        if (a.barber_name) {
            if (!barberStats[a.barber_name]) {
                barberStats[a.barber_name] = { count: 0, total: 0 };
            }
            barberStats[a.barber_name].count++;
            barberStats[a.barber_name].total += parseFloat(a.price) || 0;
        }
    });

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* Kartice */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-2xl font-bold text-gray-800">
                        {appointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Ukupno termina</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-2xl font-bold text-green-600">
                        {totalEarnings.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">Ukupna zarada</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-3xl mb-2">📆</div>
                    <p className="text-2xl font-bold text-amber-600">
                        {todayAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Danas</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-3xl mb-2">🔜</div>
                    <p className="text-2xl font-bold text-blue-600">
                        {upcomingAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Predstojeći</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statistika po uslugama */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        📊 Po uslugama
                    </h3>
                    {Object.keys(serviceStats).length === 0 ? (
                        <p className="text-gray-400 text-sm">Nema podataka</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(serviceStats)
                                .sort((a, b) => b[1].count - a[1].count)
                                .map(([service, stats]) => (
                                    <div
                                        key={service}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {service}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {stats.count}x
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {stats.total.toFixed(2)}€
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Statistika po frizerima */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        🧔 Po frizerima
                    </h3>
                    {Object.keys(barberStats).length === 0 ? (
                        <p className="text-gray-400 text-sm">Nema podataka</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(barberStats)
                                .sort((a, b) => b[1].count - a[1].count)
                                .map(([barber, stats]) => (
                                    <div
                                        key={barber}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700">
                                            🧔 {barber}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {stats.count}x
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {stats.total.toFixed(2)}€
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
