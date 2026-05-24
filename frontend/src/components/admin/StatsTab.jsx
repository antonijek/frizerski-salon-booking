import { useState, useEffect, useCallback } from "react";
import appointmentService from "../../services/appointmentService";
import LoadingSpinner from "../common/LoadingSpinner";

const StatsTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await appointmentService.getStats();
            setStats(data);
        } catch (err) {
            setError(err.error || "Greška pri učitavanju statistike");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) return <LoadingSpinner message="Učitavanje statistike..." />;

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                >
                    Pokušaj ponovo
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-500">Nema podataka za statistiku</p>
            </div>
        );
    }

    const statCards = [
        {
            icon: "📅",
            label: "Ukupno termina",
            value: stats.totalAppointments || 0,
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: "✅",
            label: "Današnji termini",
            value: stats.todayAppointments || 0,
            color: "bg-green-50 text-green-600",
        },
        {
            icon: "👥",
            label: "Registrovanih korisnika",
            value: stats.totalUsers || 0,
            color: "bg-purple-50 text-purple-600",
        },
        {
            icon: "✂️",
            label: "Aktivnih usluga",
            value: stats.totalServices || 0,
            color: "bg-amber-50 text-amber-600",
        },
        {
            icon: "🧔",
            label: "Aktivnih frizera",
            value: stats.totalBarbers || 0,
            color: "bg-teal-50 text-teal-600",
        },
        {
            icon: "💰",
            label: "Ukupna zarada",
            value: `${parseFloat(stats.totalRevenue || 0).toFixed(2)}€`,
            color: "bg-emerald-50 text-emerald-600",
        },
    ];

    const renderTable = (title, headers, rows, rowRenderer) => (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {title}
            </h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            {headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="text-left px-4 py-3 text-sm font-semibold text-gray-700"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                                {rowRenderer(row, i)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 text-sm">
                    Pregled statistike salona
                </p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                    🔄 Osveži
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-14 h-14 rounded-xl ${card.color} flex items-center justify-center text-2xl`}
                            >
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.appointmentsByService?.length > 0 &&
                renderTable(
                    "Termini po uslugama",
                    ["Usluga", "Broj termina"],
                    stats.appointmentsByService,
                    (s) => (
                        <>
                            <td className="px-4 py-3 text-sm text-gray-800">
                                {s.service}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {s.count}
                            </td>
                        </>
                    ),
                )}

            {stats.appointmentsByBarber?.length > 0 &&
                renderTable(
                    "Termini po frizerima",
                    ["Frizer", "Broj termina"],
                    stats.appointmentsByBarber,
                    (b) => (
                        <>
                            <td className="px-4 py-3 text-sm text-gray-800">
                                {b.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {b.count}
                            </td>
                        </>
                    ),
                )}

            {stats.monthlyStats?.length > 0 &&
                renderTable(
                    "Termini po mesecima",
                    ["Mesec", "Broj termina"],
                    stats.monthlyStats,
                    (m) => (
                        <>
                            <td className="px-4 py-3 text-sm text-gray-800">
                                {m.month}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {m.count}
                            </td>
                        </>
                    ),
                )}

            {stats.monthlyRevenue?.length > 0 &&
                renderTable(
                    "Prihod po mesecima",
                    ["Mesec", "Prihod"],
                    stats.monthlyRevenue,
                    (m) => (
                        <>
                            <td className="px-4 py-3 text-sm text-gray-800">
                                {m.month}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {parseFloat(m.revenue || 0).toFixed(2)}€
                            </td>
                        </>
                    ),
                )}
        </div>
    );
};

export default StatsTab;
