import { useState, useEffect, useCallback } from "react";
import appointmentService from "../../services/appointmentService";
import LoadingSpinner from "../common/LoadingSpinner";
import PeriodFilter from "./stats/PeriodFilter";

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

    const handlePeriodChange = (key) => {
        setPeriod(key);
        if (key !== "custom") {
            fetchStats(key);
        }
    };

    if (loading) return <LoadingSpinner message="Učitavanje statistike..." />;

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
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
                <p className="text-primary-light">
                    Nema podataka za statistiku
                </p>
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
            color: "bg-primary-light text-primary",
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
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                {title}
            </h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-neutral border-b">
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    className="text-left px-4 py-3 text-sm font-semibold text-primary-dark"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((row, i) => (
                            <tr
                                key={row.service ?? row.name ?? row.month ?? i}
                                className="hover:bg-primary-light transition"
                            >
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
                <p className="text-primary-light text-sm">
                    Pregled statistike salona
                </p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-neutral text-primary-dark rounded-lg hover:bg-primary-light transition text-sm"
                >
                    🔄 Osveži
                </button>
            </div>

            <PeriodFilter
                period={period}
                startDate={startDate}
                endDate={endDate}
                onPeriodChange={handlePeriodChange}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onCustomSubmit={() => fetchStats()}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-14 h-14 rounded-xl ${card.color} flex items-center justify-center text-2xl`}
                            >
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm text-primary-light">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold text-primary-dark">
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
                            <td className="px-4 py-3 text-sm text-primary-dark">
                                {s.service}
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-light">
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
                            <td className="px-4 py-3 text-sm text-primary-dark">
                                {b.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-light">
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
                            <td className="px-4 py-3 text-sm text-primary-dark">
                                {m.month}
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-light">
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
                            <td className="px-4 py-3 text-sm text-primary-dark">
                                {m.month}
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-light">
                                {parseFloat(m.revenue || 0).toFixed(2)}€
                            </td>
                        </>
                    ),
                )}
        </div>
    );
};

export default StatsTab;
