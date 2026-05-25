import useMyProfile from "../hooks/useMyProfile";
import AppointmentCard from "./common/AppointmentCard";
import EditAppointmentModal from "./common/EditAppointmentModal";
import ConfirmDialog from "./common/ConfirmDialog";
import LoadingSpinner from "./common/LoadingSpinner";

// ============================================
// MyProfile - Moj profil sa terminima
// ============================================

const MyProfile = () => {
    const {
        phone,
        setPhone,
        searched,
        appointments,
        loading,
        error,
        editingAppointment,
        editForm,
        bookedTimes,
        saving,
        services,
        barbers,
        timeSlots,
        minDate,
        maxDateStr,
        handleSearch,
        handleDelete,
        openEditModal,
        closeEditModal,
        handleEditChange,
        handleEditSubmit,
        formatDate,
        isPastAppointment,
        deleteConfirmId,
        setDeleteConfirmId,
    } = useMyProfile();

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                👤 Moj profil
            </h2>
            <p className="text-gray-500 mb-6">
                Unesite broj telefona da vidite i upravljate svojim terminima
            </p>

            {/* Pretraga po broju telefona */}
            <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 mb-6"
            >
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="npr. 0612345678"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                >
                    🔍 Pretraži
                </button>
            </form>

            {loading && <LoadingSpinner message="Učitavanje termina..." />}

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {!loading && !error && searched && appointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-lg">
                        Nema zakazanih termina za ovaj broj telefona
                    </p>
                </div>
            )}

            {!loading && appointments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">
                        Vaši termini ({appointments.length})
                    </h3>
                    {appointments.map((appointment) => {
                        const isPast = isPastAppointment(
                            appointment.date,
                            appointment.time,
                        );
                        return (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                isPast={isPast}
                                formatDate={formatDate}
                                onEdit={openEditModal}
                                onDelete={(id) => setDeleteConfirmId(id)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Confirm dialog za brisanje termina */}
            <ConfirmDialog
                isOpen={!!deleteConfirmId}
                title="Obriši termin"
                message="Da li ste sigurni da želite da obrišete ovaj termin?"
                onConfirm={() => handleDelete(deleteConfirmId)}
                onCancel={() => setDeleteConfirmId(null)}
            />

            {/* Modal za izmenu termina */}
            <EditAppointmentModal
                editingAppointment={editingAppointment}
                editForm={editForm}
                services={services}
                barbers={barbers}
                timeSlots={timeSlots}
                bookedTimes={bookedTimes}
                saving={saving}
                minDate={minDate}
                maxDateStr={maxDateStr}
                onClose={closeEditModal}
                onChange={handleEditChange}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
};

export default MyProfile;
