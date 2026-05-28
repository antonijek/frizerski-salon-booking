import FormField from "./FormField";
import TimeSlotPicker from "./TimeSlotPicker";

// ============================================
// EditAppointmentModal - Modal za izmenu termina
// ============================================

const EditAppointmentModal = ({
    editingAppointment,
    editForm,
    services,
    barbers,
    timeSlots,
    bookedTimes,
    saving,
    error,
    minDate,
    maxDateStr,
    onClose,
    onChange,
    onSubmit,
}) => {
    if (!editingAppointment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-primary-dark">
                        Izmeni termin
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-primary-light hover:text-primary-dark text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Ime */}
                    <FormField
                        label="Ime i prezime"
                        name="name"
                        value={editForm.name}
                        onChange={onChange}
                        required
                    />

                    {/* Telefon */}
                    <FormField
                        label="Broj telefona"
                        name="phone"
                        type="tel"
                        value={editForm.phone}
                        onChange={onChange}
                        required
                    />

                    {/* Email */}
                    <FormField
                        label="Email (opciono)"
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={onChange}
                    />

                    {/* Datum */}
                    <FormField
                        label="Datum"
                        name="date"
                        type="date"
                        value={editForm.date}
                        onChange={onChange}
                        min={minDate}
                        max={maxDateStr}
                        required
                    />

                    {/* Vreme */}
                    <TimeSlotPicker
                        timeSlots={timeSlots}
                        bookedTimes={bookedTimes}
                        selectedTime={editForm.time}
                        onSelect={onChange}
                    />

                    {/* Frizer */}
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Frizer
                        </label>
                        <select
                            name="barber_id"
                            value={editForm.barber_id}
                            onChange={onChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value="">Bilo koji frizer</option>
                            {barbers.map((barber) => (
                                <option key={barber.id} value={barber.id}>
                                    {barber.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Usluga */}
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Usluga *
                        </label>
                        <select
                            name="service"
                            value={editForm.service}
                            onChange={onChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value="">Izaberite uslugu</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.name}>
                                    {service.icon} {service.name} -{" "}
                                    {service.price}€ (~{service.duration}min)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Poruka o grešci */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Dugmad */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 text-primary-dark rounded-lg hover:bg-primary-light transition font-medium"
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAppointmentModal;
