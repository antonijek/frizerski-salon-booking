import { useState, useEffect, useRef } from "react";
import galleryService from "../../services/galleryService";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";

// ============================================
// GalleryTab - Admin panel za galeriju
// ============================================

const GalleryTab = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [urlPreview, setUrlPreview] = useState("");
    const [altText, setAltText] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [addMode, setAddMode] = useState("url"); // "url" ili "upload"
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await galleryService.getAll();
            setImages(data);
        } catch (err) {
            setError("Greška pri učitavanju galerije");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Napravi preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Automatski popuni naziv iz imena fajla
        if (!altText) {
            setAltText(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!altText.trim()) return;

        try {
            setSaving(true);

            if (addMode === "upload") {
                // Upload fajla
                if (!selectedFile) return;
                const formData = new FormData();
                formData.append("image", selectedFile);
                formData.append("alt", altText.trim());
                await galleryService.upload(formData);
            } else {
                // URL slike
                if (!imageUrl.trim()) return;
                await galleryService.addByUrl({
                    src: imageUrl.trim(),
                    alt: altText.trim(),
                });
            }

            setSelectedFile(null);
            setPreview(null);
            setImageUrl("");
            setUrlPreview("");
            setAltText("");
            setShowAddForm(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            await loadImages();
        } catch (err) {
            setError("Greška pri dodavanju slike");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log("Brisanje slike ID:", id);
            const result = await galleryService.delete(id);
            console.log("Rezultat brisanja:", result);
            setDeleteConfirm(null);
            await loadImages();
        } catch (err) {
            console.error("Greška pri brisanju:", err);
            console.error("Odgovor servera:", err.response?.data);
            setError(err.response?.data?.error || "Greška pri brisanju slike");
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setSelectedFile(null);
        setPreview(null);
        setImageUrl("");
        setUrlPreview("");
        setAltText("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {/* Error poruka */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Galerija
                    </h2>
                    <p className="text-sm text-gray-500">
                        {images.length} slika u galeriji
                    </p>
                </div>
                <button
                    onClick={() =>
                        showAddForm ? resetForm() : setShowAddForm(true)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        showAddForm
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                >
                    {showAddForm ? "Otkaži" : "+ Dodaj sliku"}
                </button>
            </div>

            {/* Forma za dodavanje */}
            {showAddForm && (
                <form
                    onSubmit={handleAdd}
                    className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                    <div className="space-y-4">
                        {/* Tabs za odabir načina dodavanja */}
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setAddMode("url")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                                    addMode === "url"
                                        ? "bg-amber-600 text-white"
                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                            >
                                URL sa interneta
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddMode("upload")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                                    addMode === "upload"
                                        ? "bg-amber-600 text-white"
                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                            >
                                Upload sa računara
                            </button>
                        </div>

                        {addMode === "upload" ? (
                            <>
                                {/* Upload fajla */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Izaberi sliku sa kompjutera *
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleFileSelect}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Dozvoljeni formati: JPG, PNG, GIF, WebP
                                        (max 5MB)
                                    </p>
                                </div>

                                {/* Preview uploada */}
                                {preview && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Preview:
                                        </p>
                                        <img
                                            src={preview}
                                            alt={altText || "Preview"}
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* URL slike */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL slike sa interneta *
                                    </label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            setImageUrl(e.target.value);
                                            setUrlPreview(e.target.value);
                                        }}
                                        placeholder="https://primer.com/slika.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                    />
                                    <details className="mt-2">
                                        <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-700 font-medium">
                                            Kako da nađem URL slike?
                                        </summary>
                                        <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs text-gray-600 space-y-2">
                                            <p className="font-medium text-gray-700">
                                                Sa Facebook-a:
                                            </p>
                                            <p>
                                                1. Otvori objavu sa slikom u
                                                pregledaču (Chrome, Safari)
                                            </p>
                                            <p>
                                                2. Desni klik (ili drži prst na
                                                mobilnom) na sliku
                                            </p>
                                            <p>
                                                3. Izaberi "Otvori sliku u novoj
                                                kartici" / "Open image in new
                                                tab"
                                            </p>
                                            <p>
                                                4. Kopiraj celu adresu iz
                                                adresnog polja (počinje sa
                                                https://...)
                                            </p>
                                            <p className="font-medium text-gray-700 mt-2">
                                                Sa Instagram-a:
                                            </p>
                                            <p>
                                                1. Otvori objavu u pregledaču
                                                (ne u aplikaciji)
                                            </p>
                                            <p>
                                                2. Desni klik na sliku → "Otvori
                                                sliku u novoj kartici"
                                            </p>
                                            <p>
                                                3. Kopiraj adresu (https://...)
                                            </p>
                                            <p className="font-medium text-gray-700 mt-2">
                                                Generalno (bilo koji sajt):
                                            </p>
                                            <p>
                                                1. Desni klik na sliku →
                                                "Kopiraj adresu slike" (Copy
                                                image address)
                                            </p>
                                            <p>
                                                2. Ili: otvori sliku u novoj
                                                kartici pa kopiraj adresu
                                            </p>
                                            <p>3. Nalepi ovde (Ctrl+V)</p>
                                        </div>
                                    </details>
                                </div>

                                {/* Preview URL-a */}
                                {urlPreview && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Preview:
                                        </p>
                                        <img
                                            src={urlPreview}
                                            alt={altText || "Preview"}
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                            onLoad={(e) => {
                                                e.target.style.display =
                                                    "block";
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Naziv slike */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Naziv slike *
                            </label>
                            <input
                                type="text"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Opis slike"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                (addMode === "upload" && !selectedFile) ||
                                (addMode === "url" && !imageUrl.trim())
                            }
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? "Dodavanje..." : "Dodaj sliku"}
                        </button>
                    </div>
                </form>
            )}

            {/* Grid slika */}
            {images.length === 0 ? (
                <EmptyState
                    icon="🖼️"
                    title="Nema slika u galeriji"
                    description="Dodajte prvu sliku klikom na dugme iznad."
                />
            ) : (
                <div className="flex flex-wrap justify-center gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] max-w-xs"
                        >
                            <div className="aspect-square">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://via.placeholder.com/300x300?text=Greška";
                                    }}
                                />
                            </div>
                            <div className="p-2">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                    {image.alt}
                                </p>
                            </div>
                            {/* Delete overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => setDeleteConfirm(image.id)}
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                                >
                                    Obriši
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm dialog za brisanje */}
            {deleteConfirm && (
                <ConfirmDialog
                    isOpen={true}
                    title="Obriši sliku"
                    message="Da li ste sigurni da želite da obrišete ovu sliku?"
                    onConfirm={() => handleDelete(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default GalleryTab;
