import AdminModal from "../AdminModal";
import TimeSlotPicker from "../../common/TimeSlotPicker";

const EditAppointmentForm = ({
    editingAppointment,
    editForm,
    saving,
    error,
    timeSlots,
    bookedTimes,
    services,
    barbers,
    closeEditForm,
    handleEditChange,
    handleEditSubmit,
}) => {
    if (!editingAppointment) return null;

    return (
        <AdminModal
            isOpen={!!editingAppointment}
            onClose={closeEditForm}
            title="Izmeni termin"
        >
            <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Ime i prezime *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="npr. Petar Petrović"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Telefon *
                    </label>
                    <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        placeholder="npr. 067551384"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Email (opciono)
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        placeholder="npr. petar@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Datum *
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>

                {/* Vreme - TimeSlotPicker */}
                <TimeSlotPicker
                    timeSlots={timeSlots}
                    bookedTimes={bookedTimes}
                    selectedTime={editForm.time}
                    onSelect={handleEditChange}
                />
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Usluga *
                    </label>
                    <select
                        name="service"
                        value={editForm.service}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                        <option value="">Izaberi uslugu</option>
                        {services.map((s) => (
                            <option key={s.name} value={s.name}>
                                {s.icon || "✂️"} {s.name} -{" "}
                                {parseFloat(s.price).toFixed(2)}€
                                {s.duration ? ` (~${s.duration}min)` : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Frizer
                    </label>
                    <select
                        name="barber_id"
                        value={editForm.barber_id}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                        <option value="">Automatski dodeli</option>
                        {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                                🧔 {b.name}
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

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={closeEditForm}
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
        </AdminModal>
    );
};

export default EditAppointmentForm;
