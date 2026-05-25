import { useState, useCallback, useEffect } from "react";
import salonConfig from "../../config/salonConfig";
import SectionWrapper from "./SectionWrapper";
import galleryService from "../../services/galleryService";

// ============================================
// Gallery - Galerija slika sa lightbox-om
// ============================================

const Gallery = () => {
    const { gallery } = salonConfig;
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const data = await galleryService.getAll();
            setImages(data);
        } catch (err) {
            console.error("Greška pri učitavanju galerije:", err);
            // Fallback na konfiguraciju ako API ne radi
            setImages(gallery?.images || []);
        }
    };

    const handlePrev = useCallback(() => {
        setSelectedImage((prev) => {
            if (!prev) return null;
            const idx = images.findIndex((img) => img.src === prev.src);
            return images[(idx - 1 + images.length) % images.length];
        });
    }, [images]);

    const handleNext = useCallback(() => {
        setSelectedImage((prev) => {
            if (!prev) return null;
            const idx = images.findIndex((img) => img.src === prev.src);
            return images[(idx + 1) % images.length];
        });
    }, [images]);

    // Ako galerija nije ukljucena ili nema slika, ne prikazuj nista
    if (!gallery?.enabled || !images.length) return null;

    return (
        <SectionWrapper
            title={gallery.title}
            subtitle={gallery.subtitle}
            background="bg-gray-50"
        >
            {/* Grid slika - centriran u svakom redu */}
            <div className="flex flex-wrap justify-center gap-4">
                {images.map((image, index) => (
                    <div
                        key={image.id || index}
                        onClick={() => setSelectedImage(image)}
                        className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] max-w-sm"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />
                        {/* Overlay na hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white font-medium text-sm">
                                    {image.alt}
                                </p>
                            </div>
                        </div>
                        {/* Ikonica zumiranja */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg
                                    className="w-6 h-6 text-gray-800"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Zatvori */}
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {/* Prethodna */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {/* Slika */}
                    <img
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Sledeca */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    {/* Info */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
                        <p className="font-medium">{selectedImage.alt}</p>
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
};

export default Gallery;
