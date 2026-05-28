const periodOptions = [
    { key: "all", label: "Sve vreme" },
    { key: "week", label: "Poslednja sedmica" },
    { key: "month", label: "Poslednji mesec" },
    { key: "year", label: "Poslednja godina" },
    { key: "custom", label: "Odredjen datum" },
];

const PeriodFilter = ({
    period,
    startDate,
    endDate,
    onPeriodChange,
    onStartDateChange,
    onEndDateChange,
    onCustomSubmit,
}) => {
    return (
        <>
            {/* Filteri za period */}
            <div className="flex flex-wrap gap-2 mb-6">
                {periodOptions.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => onPeriodChange(opt.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            period === opt.key
                                ? "bg-primary text-white"
                                : "bg-neutral text-primary-dark hover:bg-primary-light"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {period === "custom" && (
                <div className="flex flex-wrap gap-3 mb-6 items-end">
                    <div>
                        <label className="block text-xs text-primary-light mb-1">
                            Od datuma
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-primary-light mb-1">
                            Do datuma
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={onCustomSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm"
                    >
                        Prikaži
                    </button>
                </div>
            )}
        </>
    );
};

export default PeriodFilter;
