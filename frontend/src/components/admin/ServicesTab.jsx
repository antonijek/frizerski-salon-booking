import useAdminServices from "../../hooks/useAdminServices";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import AdminModal from "./AdminModal";
import ConfirmDialog from "../common/ConfirmDialog";

const ServicesTab = () => {
    const {
        services,
        loading,
        error,
        successMessage,
        showForm,
        editingService,
        form,
        saving,
        confirmDelete,
        openCreateForm,
        openEditForm,
        closeForm,
        handleChange,
        handleSubmit,
        handleDelete,
        setConfirmDelete,
        clearError,
    } = useAdminServices();

    if (loading) return <LoadingSpinner message="Učitavanje usluga..." />;

    return (
        <div>
            <NotificationBanner
                type="error"
                message={error}
                onClose={clearError}
            />
            <NotificationBanner type="success" message={successMessage} />

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 text-sm">
                    {services.length} usluga
                </p>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
                >
                    + Dodaj uslugu
                </button>
            </div>

            {services.length === 0 ? (
                <EmptyState icon="✂️" message="Nema usluga" />
            ) : (
                <div className="grid gap-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">
                                    {service.icon || "✂️"}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {service.duration} min
                                    </p>
                                    {service.description && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-amber-600">
                                    {parseFloat(service.price).toFixed(2)}€
                                </span>
                                <button
                                    onClick={() => openEditForm(service)}
                                    className="text-amber-600 hover:text-amber-800 transition"
                                    title="Izmeni uslugu"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(service)}
                                    className="text-red-500 hover:text-red-700 transition"
                                    title="Obriši uslugu"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal za dodavanje/izmenu usluge */}
            <AdminModal
                isOpen={showForm}
                onClose={closeForm}
                title={editingService ? "Izmeni uslugu" : "Dodaj uslugu"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ikona
                        </label>
                        <input
                            type="text"
                            name="icon"
                            value={form.icon}
                            onChange={handleChange}
                            placeholder="✂️"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Naziv usluge *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="npr. Šišanje"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trajanje (min) *
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                placeholder="30"
                                min="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cena (€) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="15"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opis (opciono)
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Kratak opis usluge..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeForm}
                            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? "Čuvanje..."
                                : editingService
                                  ? "Sačuvaj izmene"
                                  : "Dodaj uslugu"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Confirm dialog za brisanje */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Obriši uslugu"
                message={`Da li ste sigurni da želite da obrišete uslugu "${confirmDelete?.name}"?`}
                onConfirm={() => {
                    handleDelete(confirmDelete);
                    setConfirmDelete(null);
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default ServicesTab;
