const filterOptions = [
    { key: "all", label: "Svi termini" },
    { key: "today", label: "Danas" },
    { key: "upcoming", label: "Predstojeći" },
    { key: "past", label: "Prošli" },
];

const AdminFilters = ({
    filter,
    setFilter,
    selectedDate,
    setSelectedDate,
    selectedBarber,
    setSelectedBarber,
    barbers = [],
    onRefresh,
    onReset,
    showReset = false,
}) => {
    return (
        <div>
            {/* Filter dugmad */}
            <div className="flex flex-wrap gap-2 mb-4">
                {filterOptions.map((f) => (
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

            {/* Filter inputi */}
            <div className="flex flex-wrap gap-3 mb-6 items-end">
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
                    onClick={onRefresh}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    title="Osveži"
                >
                    🔄 Osveži
                </button>

                {showReset && (
                    <button
                        onClick={onReset}
                        className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                        ✕ Poništi filtere
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminFilters;
