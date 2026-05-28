import { useState, useEffect, useRef } from "react";
import galleryService from "../../services/galleryService";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import GalleryAddForm from "./gallery/GalleryAddForm";

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

            // Učitaj galeriju ponovo - ako ovo padne, slika je ipak dodata
            try {
                await loadImages();
            } catch (loadErr) {
                console.error(
                    "Greška pri osvežavanju galerije (slika je dodata):",
                    loadErr,
                );
                setError(
                    "Slika je dodata, ali greška pri osvežavanju galerije",
                );
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.error ||
                err.message ||
                "Greška pri dodavanju slike";
            console.error("Greška pri dodavanju slike:", err);
            console.error("Detalji:", err.response?.data);
            setError(errorMsg);
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
                    <h2 className="text-lg font-semibold text-primary-dark">
                        Galerija
                    </h2>
                    <p className="text-sm text-primary-light">
                        {images.length} slika u galeriji
                    </p>
                </div>
                <button
                    onClick={() =>
                        showAddForm ? resetForm() : setShowAddForm(true)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        showAddForm
                            ? "bg-neutral text-primary-dark hover:bg-primary-light"
                            : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                >
                    {showAddForm ? "Otkaži" : "+ Dodaj sliku"}
                </button>
            </div>

            <GalleryAddForm
                showAddForm={showAddForm}
                addMode={addMode}
                setAddMode={setAddMode}
                saving={saving}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                urlPreview={urlPreview}
                setUrlPreview={setUrlPreview}
                selectedFile={selectedFile}
                preview={preview}
                altText={altText}
                setAltText={setAltText}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                handleAdd={handleAdd}
            />

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
                                <p className="text-sm font-medium text-primary-dark truncate">
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
