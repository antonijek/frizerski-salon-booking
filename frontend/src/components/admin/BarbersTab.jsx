import useAdminBarbers from "../../hooks/useAdminBarbers";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import AdminModal from "./AdminModal";
import ConfirmDialog from "../common/ConfirmDialog";

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
                <p className="text-gray-500 text-sm">
                    {barbers.length} frizera
                </p>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
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
                            className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden">
                                    {barber.image_url ? (
                                        <img
                                            src={barber.image_url}
                                            alt={barber.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
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
                                    <h3 className="font-semibold text-gray-800">
                                        {barber.name}
                                    </h3>
                                    {barber.title && (
                                        <p className="text-sm text-amber-600">
                                            {barber.title}
                                        </p>
                                    )}
                                    {barber.bio && (
                                        <p className="text-sm text-gray-400 mt-1">
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
                                    className="text-amber-600 hover:text-amber-800 transition"
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
            <AdminModal
                isOpen={showForm}
                onClose={closeForm}
                title={editingBarber ? "Izmeni frizera" : "Dodaj frizera"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ime i prezime *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="npr. Marko Marković"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slika
                        </label>

                        {/* URL slike (default) */}
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">
                                    URL slike sa interneta
                                </span>
                            </div>
                            <input
                                type="text"
                                name="image_url"
                                value={form.image_url}
                                onChange={handleChange}
                                placeholder="https://primer.com/slika.jpg"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                            />
                            <details className="mt-1">
                                <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-700 font-medium">
                                    Kako da nađem URL slike?
                                </summary>
                                <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs text-gray-600 space-y-2">
                                    <p className="font-medium text-gray-700">
                                        Sa Facebook-a:
                                    </p>
                                    <p>
                                        1. Otvori objavu sa slikom u pregledaču
                                        (Chrome, Safari)
                                    </p>
                                    <p>
                                        2. Desni klik (ili drži prst na
                                        mobilnom) na sliku
                                    </p>
                                    <p>
                                        3. Izaberi &ldquo;Otvori sliku u novoj
                                        kartici&rdquo; / &ldquo;Open image in
                                        new tab&rdquo;
                                    </p>
                                    <p>
                                        4. Kopiraj celu adresu iz adresnog polja
                                        (počinje sa https://...)
                                    </p>
                                    <p className="font-medium text-gray-700 mt-2">
                                        Sa Instagram-a:
                                    </p>
                                    <p>
                                        1. Otvori objavu u pregledaču (ne u
                                        aplikaciji)
                                    </p>
                                    <p>
                                        2. Desni klik na sliku → &ldquo;Otvori
                                        sliku u novoj kartici&rdquo;
                                    </p>
                                    <p>3. Kopiraj adresu (https://...)</p>
                                    <p className="font-medium text-gray-700 mt-2">
                                        Generalno (bilo koji sajt):
                                    </p>
                                    <p>
                                        1. Desni klik na sliku → &ldquo;Kopiraj
                                        adresu slike&rdquo; (Copy image address)
                                    </p>
                                    <p>
                                        2. Ili: otvori sliku u novoj kartici pa
                                        kopiraj adresu
                                    </p>
                                    <p>3. Nalepi ovde (Ctrl+V)</p>
                                </div>
                            </details>
                        </div>

                        {/* Ili upload sa računara */}
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">
                                    ILI
                                </span>
                                <span className="text-xs text-gray-400">
                                    uploaduj sa računara
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                                        <span className="text-lg">📁</span>
                                        <span className="text-sm text-gray-600">
                                            {uploadingImage
                                                ? "Uploadovanje..."
                                                : "Izaberi sliku sa računara"}
                                        </span>
                                    </div>
                                </label>
                                {form.image_url && (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={form.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    image_url: "",
                                                }))
                                            }
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                            Dozvoljeni formati: JPG, PNG, GIF, WebP (max 10MB za
                            upload)
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titula
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="npr. Senior Barber"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio / Opis
                        </label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Kratak opis frizera..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Radni dani
                        </label>
                        <div className="grid grid-cols-7 gap-1">
                            {[
                                { key: "1", label: "Pon" },
                                { key: "2", label: "Uto" },
                                { key: "3", label: "Sri" },
                                { key: "4", label: "Čet" },
                                { key: "5", label: "Pet" },
                                { key: "6", label: "Sub" },
                                { key: "7", label: "Ned" },
                            ].map((day) => {
                                const workDays = (form.work_days || "")
                                    .split(",")
                                    .map((d) => d.trim());
                                const isChecked = workDays.includes(day.key);
                                return (
                                    <label
                                        key={day.key}
                                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer border transition ${
                                            isChecked
                                                ? "bg-amber-100 border-amber-400 text-amber-800"
                                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="work_days"
                                            value={day.key}
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const currentDays = (
                                                    form.work_days || ""
                                                )
                                                    .split(",")
                                                    .map((d) => d.trim())
                                                    .filter(Boolean);
                                                let newDays;
                                                if (e.target.checked) {
                                                    newDays = [
                                                        ...currentDays,
                                                        day.key,
                                                    ];
                                                } else {
                                                    newDays =
                                                        currentDays.filter(
                                                            (d) =>
                                                                d !== day.key,
                                                        );
                                                }
                                                setForm((prev) => ({
                                                    ...prev,
                                                    work_days:
                                                        newDays.join(","),
                                                }));
                                            }}
                                            className="sr-only"
                                        />
                                        <span className="text-xs font-medium">
                                            {day.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Početak rada
                            </label>
                            <input
                                type="time"
                                name="work_start"
                                value={form.work_start}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kraj rada
                            </label>
                            <input
                                type="time"
                                name="work_end"
                                value={form.work_end}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label
                            htmlFor="is_active"
                            className="text-sm font-medium text-gray-700"
                        >
                            Aktivan frizer
                        </label>
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
                                : editingBarber
                                  ? "Sačuvaj izmene"
                                  : "Dodaj frizera"}
                        </button>
                    </div>
                </form>
            </AdminModal>

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
