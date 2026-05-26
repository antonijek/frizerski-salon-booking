// ============================================
// TimeSlotPicker - Grid za izbor vremenskog termina
// ============================================

const TimeSlotPicker = ({
    timeSlots,
    bookedTimes,
    pastSlots = [],
    selectedTime,
    onSelect,
    error,
    touched,
}) => {
    // Kombinujemo buduce i prosle slotove za prikaz, sortirano po vremenu
    const allSlots = [...timeSlots, ...pastSlots].sort();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Vreme *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allSlots.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    const isPast = pastSlots.includes(time);
                    const isDisabled = isBooked || isPast;

                    let buttonClass =
                        "py-2 px-3 rounded-lg text-sm font-medium transition";

                    if (selectedTime === time) {
                        buttonClass += " bg-amber-600 text-white";
                    } else if (isBooked) {
                        buttonClass +=
                            " bg-red-100 text-red-400 cursor-not-allowed line-through";
                    } else if (isPast) {
                        buttonClass +=
                            " bg-gray-200 text-gray-400 cursor-not-allowed line-through";
                    } else {
                        buttonClass +=
                            " bg-gray-100 text-gray-700 hover:bg-gray-200";
                    }

                    return (
                        <button
                            key={time}
                            type="button"
                            disabled={isDisabled}
                            onClick={() =>
                                onSelect({
                                    target: {
                                        name: "time",
                                        value: time,
                                    },
                                })
                            }
                            className={buttonClass}
                        >
                            {time}
                            {isBooked && " ❌"}
                            {isPast && " ⏰"}
                        </button>
                    );
                })}
            </div>
            {pastSlots.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                    ⏰ Termini sa satom su već prošli i nisu dostupni za
                    zakazivanje
                </p>
            )}
            {touched && error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default TimeSlotPicker;
