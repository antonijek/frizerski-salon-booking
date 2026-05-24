// ============================================
// TimeSlotPicker - Grid za izbor vremenskog termina
// ============================================

const TimeSlotPicker = ({
    timeSlots,
    bookedTimes,
    selectedTime,
    onSelect,
    error,
    touched,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Vreme *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                        <button
                            key={time}
                            type="button"
                            disabled={isBooked}
                            onClick={() =>
                                onSelect({
                                    target: {
                                        name: "time",
                                        value: time,
                                    },
                                })
                            }
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                                selectedTime === time
                                    ? "bg-amber-600 text-white"
                                    : isBooked
                                      ? "bg-red-100 text-red-400 cursor-not-allowed line-through"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {time}
                            {isBooked && " ❌"}
                        </button>
                    );
                })}
            </div>
            {touched && error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default TimeSlotPicker;
