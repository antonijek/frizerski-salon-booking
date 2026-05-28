import useAdminBarbers from "../../hooks/useAdminBarbers";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import ConfirmDialog from "../common/ConfirmDialog";
import BarberForm from "./barber/BarberForm";

const BarbersTab = () => {
    const {
        barbers,
        loading,
        error,
        successMessage,
        showForm,
        editingBarber,
        form,
        saving,
        uploadingImage,
        confirmDelete,
        openCreateForm,
        openEditForm,
        closeForm,
        handleChange,
        setForm,
        handleSubmit,
        handleDelete,
        setConfirmDelete,
        handleToggleActive,
        handleImageUpload,
        clearError,
    } = useAdminBarbers();

    if (loading) return <LoadingSpinner message="Učitavanje frizera..." />;

    return (
        <div>
            <NotificationBanner
                type="error"
                message={error}
                onClose={clearError}
            />
            <NotificationBanner type="success" message={successMessage} />

            <div className="flex justify-between items-center mb-6">
                <p className="text-primary-light text-sm">
                    {barbers.length} frizera
                </p>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium"
                >
                    + Dodaj frizera
                </button>
            </div>

            {barbers.length === 0 ? (
                <EmptyState icon="🧔" message="Nema frizera" />
            ) : (
                <div className="grid gap-4">
                    {barbers.map((barber) => (
                        <div
                            key={barber.id}
                            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                                    {barber.image_url ? (
                                        <img
                                            src={barber.image_url}
                                            alt={barber.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-primary-solid flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">
                                                {barber.name
                                                    .split(" ")
                                                    .filter(Boolean)
                                                    .slice(0, 2)
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-primary-dark">
                                        {barber.name}
                                    </h3>
                                    {barber.title && (
                                        <p className="text-sm text-primary">
                                            {barber.title}
                                        </p>
                                    )}
                                    {barber.bio && (
                                        <p className="text-sm text-primary-light mt-1">
                                            {barber.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleActive(barber)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        barber.is_active === 1 ||
                                        barber.is_active === true
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                    }`}
                                >
                                    {barber.is_active === 1 ||
                                    barber.is_active === true
                                        ? "Aktivan"
                                        : "Neaktivan"}
                                </button>
                                <button
                                    onClick={() => openEditForm(barber)}
                                    className="text-primary hover:text-primary-hover transition"
                                    title="Izmeni frizera"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(barber)}
                                    className="text-red-500 hover:text-red-700 transition"
                                    title="Obriši frizera"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal za dodavanje/izmenu frizera */}
            <BarberForm
                showForm={showForm}
                editingBarber={editingBarber}
                form={form}
                saving={saving}
                uploadingImage={uploadingImage}
                closeForm={closeForm}
                handleChange={handleChange}
                setForm={setForm}
                handleSubmit={handleSubmit}
                handleImageUpload={handleImageUpload}
            />

            {/* Confirm dialog za brisanje */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Obriši frizera"
                message={`Da li ste sigurni da želite da obrišete frizera "${confirmDelete?.name}"?`}
                onConfirm={() => {
                    handleDelete(confirmDelete);
                    setConfirmDelete(null);
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default BarbersTab;
