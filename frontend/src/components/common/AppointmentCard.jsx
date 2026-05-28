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
                    ? "border-primary-light bg-neutral opacity-75"
                    : "border-primary-light"
            }`}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span
                            className={`font-semibold ${
                                isPast
                                    ? "text-primary-light"
                                    : "text-primary-dark"
                            }`}
                        >
                            {formatDate(appointment.date)}
                            {isPast && (
                                <span className="ml-2 text-sm text-primary-light">
                                    (prošli termin)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⏰</span>
                        <span className="text-primary-dark">
                            {appointment.time.slice(0, 5)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✂️</span>
                        <span className="text-primary-dark">
                            {appointment.service}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        <span className="text-primary-dark">
                            {appointment.name}
                        </span>
                    </div>
                    {appointment.barber_name && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🧔</span>
                            <span className="text-primary-dark">
                                Frizer: {appointment.barber_name}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📞</span>
                        <span className="text-primary-dark">
                            {appointment.phone}
                        </span>
                    </div>
                    {appointment.email && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📧</span>
                            <span className="text-primary-dark">
                                {appointment.email}
                            </span>
                        </div>
                    )}
                </div>
                {!isPast && (
                    <div className="flex gap-2 sm:self-start">
                        <button
                            onClick={() => onEdit(appointment)}
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm"
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
