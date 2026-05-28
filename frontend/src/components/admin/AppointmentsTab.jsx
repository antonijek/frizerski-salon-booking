import useAdminAppointments from "../../hooks/useAdminAppointments";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import AdminFilters from "./AdminFilters";
import ConfirmDialog from "../common/ConfirmDialog";
import EditAppointmentForm from "./appointment/EditAppointmentForm";

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
        timeSlots,
        bookedTimes,
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
                                <tr className="bg-neutral border-b">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Ime
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Telefon
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Datum
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Vreme
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Usluga
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Frizer
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Akcija
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {appointments.map((app) => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-primary-light transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-primary-dark">
                                            {app.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.phone}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.email || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.time}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.service}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {app.barber_name ? (
                                                <span>
                                                    🧔 {app.barber_name}
                                                </span>
                                            ) : (
                                                <span className="text-primary-light">
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
                                                    className="text-primary hover:text-primary-hover transition text-sm"
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
                    <div className="bg-neutral px-4 py-3 text-sm text-primary-light border-t">
                        Ukupno: {appointments.length} termina
                    </div>
                </div>
            )}

            <EditAppointmentForm
                editingAppointment={editingAppointment}
                editForm={editForm}
                saving={saving}
                error={error}
                timeSlots={timeSlots}
                bookedTimes={bookedTimes}
                services={services}
                barbers={barbers}
                closeEditForm={closeEditForm}
                handleEditChange={handleEditChange}
                handleEditSubmit={handleEditSubmit}
            />

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
