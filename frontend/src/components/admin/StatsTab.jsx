import { useState, useEffect, useCallback } from "react";
import appointmentService from "../../services/appointmentService";
import LoadingSpinner from "../common/LoadingSpinner";

const periodOptions = [
    { key: "all", label: "Sve vreme" },
    { key: "week", label: "Poslednja sedmica" },
    { key: "month", label: "Poslednji mesec" },
    { key: "year", label: "Poslednja godina" },
    { key: "custom", label: "Odredjen datum" },
];

const StatsTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [period, setPeriod] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchStats = useCallback(
        async (customPeriod, customStart, customEnd) => {
            setLoading(true);
            setError("");
            try {
                const effectivePeriod = customPeriod || period;
                const sDate = customStart || startDate;
                const eDate = customEnd || endDate;
                const filters = { period: effectivePeriod };
                if (effectivePeriod === "custom") {
                    if (!sDate || !eDate) {
                        setError("Izaberite početni i krajnji datum");
                        setLoading(false);
                        return;
                    }
                    filters.start_date = sDate;
                    filters.end_date = eDate;
                }
                console.log("[StatsTab] fetchStats:", filters);
                const data = await appointmentService.getStats(filters);
                console.log("[StatsTab] data:", data);
                setStats(data);
            } catch (err) {
                console.error("[StatsTab] error:", err);
                setError(err.error || "Greška pri učitavanju statistike");
            } finally {
                setLoading(false);
            }
        },
        [period, startDate, endDate],
    );

    // Učitaj podatke na početku (samo jednom)
    useEffect(() => {
        fetchStats();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

            {/* Filteri za period */}
            <div className="flex flex-wrap gap-2 mb-6">
                {periodOptions.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => {
                            setPeriod(opt.key);
                            if (opt.key !== "custom") {
                                fetchStats(opt.key);
                            }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            period === opt.key
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {period === "custom" && (
                <div className="flex flex-wrap gap-3 mb-6 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Od datuma
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Do datuma
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={() => {
                            console.log(
                                "[StatsTab] Prikaži kliknut, period:",
                                period,
                                "startDate:",
                                startDate,
                                "endDate:",
                                endDate,
                            );
                            fetchStats();
                        }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm"
                    >
                        Prikaži
                    </button>
                </div>
            )}

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
