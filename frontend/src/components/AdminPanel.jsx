import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";

// ============================================
// AdminPanel - Administratorski panel
// ============================================

const AdminPanel = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // 'all' | 'today' | 'upcoming' | 'past'
    const [successMessage, setSuccessMessage] = useState("");

    // Proveri da li je korisnik admin
    useEffect(() => {
        if (!user?.isAdmin) {
            onNavigate("/");
            return;
        }
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

    // Filtriranje termina
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

    // Sortiranje po datumu (najnoviji prvi)
    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Učitavanje termina...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Upravljanje terminima
                    </p>
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

            {/* Poruke */}
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

            {/* Tabela termina */}
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

export default AdminPanel;
