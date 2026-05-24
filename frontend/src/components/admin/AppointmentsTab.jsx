import useAdminAppointments from "../../hooks/useAdminAppointments";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import AdminFilters from "./AdminFilters";
import AdminModal from "./AdminModal";
import ConfirmDialog from "../common/ConfirmDialog";

const AppointmentsTab = () => {
    const {
        appointments,
        barbers,
        services,
        loading,
        error,
        successMessage,
        filter,
        selectedBarber,
        selectedDate,
        editingAppointment,
        editForm,
        saving,
        confirmDelete,
        setFilter,
        setSelectedBarber,
        setSelectedDate,
        fetchAppointments,
        setConfirmDelete,
        handleDelete,
        openEditForm,
        closeEditForm,
        handleEditChange,
        handleEditSubmit,
        resetFilters,
        clearError,
    } = useAdminAppointments();

    if (loading) return <LoadingSpinner message="Učitavanje termina..." />;

    return (
        <div>
            <NotificationBanner
                type="error"
                message={error}
                onClose={clearError}
            />
            <NotificationBanner type="success" message={successMessage} />

            <AdminFilters
                filter={filter}
                setFilter={setFilter}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedBarber={selectedBarber}
                setSelectedBarber={setSelectedBarber}
                barbers={barbers}
                onRefresh={fetchAppointments}
                onReset={resetFilters}
                showReset={selectedDate !== "" || selectedBarber !== "all"}
            />

            {appointments.length === 0 ? (
                <EmptyState icon="📅" message="Nema termina" />
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Ime
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Telefon
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Datum
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Vreme
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Usluga
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                        Frizer
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                                        Akcija
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {appointments.map((app) => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            {app.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.phone}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.email || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.time}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.service}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {app.barber_name ? (
                                                <span>
                                                    🧔 {app.barber_name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() =>
                                                        openEditForm(app)
                                                    }
                                                    className="text-amber-600 hover:text-amber-800 transition text-sm"
                                                    title="Izmeni termin"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setConfirmDelete(app)
                                                    }
                                                    className="text-red-500 hover:text-red-700 transition text-sm"
                                                    title="Obriši termin"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 border-t">
                        Ukupno: {appointments.length} termina
                    </div>
                </div>
            )}

            {/* Modal za izmenu termina */}
            <AdminModal
                isOpen={!!editingAppointment}
                onClose={closeEditForm}
                title="Izmeni termin"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ime i prezime *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            placeholder="npr. Petar Petrović"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon *
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            placeholder="npr. 067551384"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email (opciono)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            placeholder="npr. petar@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Datum *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={editForm.date}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vreme *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={editForm.time}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usluga *
                        </label>
                        <select
                            name="service"
                            value={editForm.service}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        >
                            <option value="">Izaberi uslugu</option>
                            {services.map((s) => (
                                <option key={s.name} value={s.name}>
                                    {s.icon || "✂️"} {s.name} -{" "}
                                    {parseFloat(s.price).toFixed(2)}€
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeEditForm}
                            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Confirm dialog za brisanje */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Obriši termin"
                message={`Da li ste sigurni da želite da obrišete termin za ${confirmDelete?.name} (${confirmDelete?.date} ${confirmDelete?.time})?`}
                onConfirm={() => {
                    handleDelete(confirmDelete.id);
                    setConfirmDelete(null);
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default AppointmentsTab;
