import AdminModal from "../AdminModal";

const DAYS = [
    { key: "1", label: "Pon" },
    { key: "2", label: "Uto" },
    { key: "3", label: "Sri" },
    { key: "4", label: "Čet" },
    { key: "5", label: "Pet" },
    { key: "6", label: "Sub" },
    { key: "7", label: "Ned" },
];

const BarberForm = ({
    showForm,
    editingBarber,
    form,
    saving,
    uploadingImage,
    closeForm,
    handleChange,
    setForm,
    handleSubmit,
    handleImageUpload,
}) => {
    if (!showForm) return null;

    return (
        <AdminModal
            isOpen={showForm}
            onClose={closeForm}
            title={editingBarber ? "Izmeni frizera" : "Dodaj frizera"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Ime i prezime *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="npr. Marko Marković"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Slika
                    </label>

                    {/* Ili upload sa računara */}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-primary-light">
                                ILI
                            </span>
                            <span className="text-xs text-primary-light">
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
                                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-primary-light transition cursor-pointer">
                                    <span className="text-lg">📁</span>
                                    <span className="text-sm text-primary-light">
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

                    <p className="text-xs text-primary-light mt-2">
                        Dozvoljeni formati: JPG, PNG, GIF, WebP (max 10MB za
                        upload)
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Titula
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="npr. Senior Barber"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Bio / Opis
                    </label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Kratak opis frizera..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-2">
                        Radni dani
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day) => {
                            const workDays = (form.work_days || "")
                                .split(",")
                                .map((d) => d.trim());
                            const isChecked = workDays.includes(day.key);
                            return (
                                <label
                                    key={day.key}
                                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer border transition ${
                                        isChecked
                                            ? "bg-primary-light border-primary text-primary-dark"
                                            : "bg-neutral border-gray-200 text-primary-light hover:bg-primary-light"
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
                                                newDays = currentDays.filter(
                                                    (d) => d !== day.key,
                                                );
                                            }
                                            setForm((prev) => ({
                                                ...prev,
                                                work_days: newDays.join(","),
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
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Početak rada
                        </label>
                        <input
                            type="time"
                            name="work_start"
                            value={form.work_start}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Kraj rada
                        </label>
                        <input
                            type="time"
                            name="work_end"
                            value={form.work_end}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                        htmlFor="is_active"
                        className="text-sm font-medium text-primary-dark"
                    >
                        Aktivan frizer
                    </label>
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={closeForm}
                        className="flex-1 py-2 border border-gray-300 text-primary-dark rounded-lg hover:bg-primary-light transition font-medium"
                    >
                        Odustani
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
};

export default BarberForm;
