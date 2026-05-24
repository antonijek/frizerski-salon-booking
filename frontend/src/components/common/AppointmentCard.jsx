// ============================================
// AppointmentCard - Kartica za prikaz termina
// ============================================

const AppointmentCard = ({
    appointment,
    isPast,
    formatDate,
    onEdit,
    onDelete,
}) => {
    return (
        <div
            className={`border rounded-xl p-4 hover:shadow-md transition ${
                isPast
                    ? "border-gray-200 bg-gray-50 opacity-75"
                    : "border-gray-200"
            }`}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span
                            className={`font-semibold ${
                                isPast ? "text-gray-500" : "text-gray-800"
                            }`}
                        >
                            {formatDate(appointment.date)}
                            {isPast && (
                                <span className="ml-2 text-sm text-gray-400">
                                    (prošli termin)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⏰</span>
                        <span className="text-gray-700">
                            {appointment.time.slice(0, 5)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✂️</span>
                        <span className="text-gray-700">
                            {appointment.service}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        <span className="text-gray-700">
                            {appointment.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📞</span>
                        <span className="text-gray-700">
                            {appointment.phone}
                        </span>
                    </div>
                    {appointment.email && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📧</span>
                            <span className="text-gray-700">
                                {appointment.email}
                            </span>
                        </div>
                    )}
                </div>
                {!isPast && (
                    <div className="flex gap-2 sm:self-start">
                        <button
                            onClick={() => onEdit(appointment)}
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                        >
                            Izmeni
                        </button>
                        <button
                            onClick={() => onDelete(appointment.id)}
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            Otkaži
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
