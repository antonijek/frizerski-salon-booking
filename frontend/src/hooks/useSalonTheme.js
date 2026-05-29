import { useState, useEffect, useCallback } from "react";
import salonService from "../services/salonService";

// ============================================
// useSalonTheme - Hook za dinamičko učitavanje teme salona
// ============================================

// Mapa fontova za Google Fonts URL-ove
const FONT_URLS = {
    Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
    "Playfair Display":
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap",
    Montserrat:
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap",
    Lora: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
    Oswald: "https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap",
    Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
};

// Podrazumevane vrednosti (ako API nije dostupan)
const DEFAULT_SALON = {
    id: 1,
    subdomain: "main",
    name: "Frizerski Salon",
    short_name: "Salon",
    tagline: "Profesionalna nega vaše kose",
    description: "Dobrodošli u naš salon gde vaša kosa dobija najbolju negu.",
    logo_url: null,
    hero_image_url: null,
    phone: "+381 61 234 567",
    email: "info@salon.rs",
    address: "Ulica bb, Grad",
    working_hours_start: "09:00",
    working_hours_end: "17:00",
    working_hours_interval: 30,
    working_days: "1,2,3,4,5,6",
    primary_color: "#d97706",
    primary_hover: "#b45309",
    primary_light: "#fffbeb",
    primary_bg_from: "#fef3c7",
    primary_bg_to: "#ffedd5",
    neutral_bg: "#f9fafb",
    text_primary: "#1f2937",
    text_secondary: "#6b7280",
    heading_font: "Inter",
    body_font: "Inter",
};

/**
 * Učitaj Google Font
 */
const loadFont = (fontName) => {
    if (!fontName || fontName === "Inter") return; // Inter je već u index.css

    const url = FONT_URLS[fontName];
    if (!url) return;

    // Proveri da li je font već učitan
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    document.head.appendChild(link);
};

/**
 * Primeni CSS varijable na body
 */
/**
 * Event name za osvežavanje podataka o salonu
 */
const SALON_REFRESH_EVENT = "salon:refresh";

/**
 * Pozovi osvežavanje podataka o salonu (nakon admin izmene)
 * Ovo će naterati useSalonTheme hook da ponovo učita podatke
 */
export const refreshSalonData = () => {
    window.dispatchEvent(new CustomEvent(SALON_REFRESH_EVENT));
};

export const applyTheme = (salon) => {
    if (!salon) return;

    const root = document.documentElement;

    // Boje
    root.style.setProperty("--color-primary", salon.primary_color || "#d97706");
    root.style.setProperty(
        "--color-primary-hover",
        salon.primary_hover || "#b45309",
    );
    root.style.setProperty(
        "--color-primary-light",
        salon.primary_light || "#fffbeb",
    );
    root.style.setProperty(
        "--color-primary-bg-from",
        salon.primary_bg_from || "#fef3c7",
    );
    root.style.setProperty(
        "--color-primary-bg-to",
        salon.primary_bg_to || "#ffedd5",
    );
    root.style.setProperty("--color-neutral-bg", salon.neutral_bg || "#f9fafb");
    root.style.setProperty(
        "--color-text-primary",
        salon.text_primary || "#1f2937",
    );
    root.style.setProperty(
        "--color-text-secondary",
        salon.text_secondary || "#6b7280",
    );

    // Fontovi
    const headingFont = salon.heading_font || "Inter";
    const bodyFont = salon.body_font || "Inter";

    root.style.setProperty("--font-heading", `"${headingFont}", sans-serif`);
    root.style.setProperty("--font-body", `"${bodyFont}", sans-serif`);

    // Učitaj fontove ako nisu Inter (Inter je već u index.css)
    loadFont(headingFont);
    if (bodyFont !== headingFont) {
        loadFont(bodyFont);
    }
};

/**
 * Hook za učitavanje teme salona
 * @param {string} subdomain - Subdomain salona (podrazumevano "main")
 * @param {boolean} skipThemeApply - Ako je true, ne primenjuje CSS varijable (koristi se na admin panelu)
 * @returns {Object} { salon, loading, error, updateSalon }
 */
const useSalonTheme = (subdomain = "main", skipThemeApply = false) => {
    const [salon, setSalon] = useState(DEFAULT_SALON);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSalon = useCallback(async () => {
        setLoading(true);
        try {
            const data = await salonService.get(subdomain);
            setSalon(data);
            if (!skipThemeApply) {
                applyTheme(data);
            }
            setError(null);
        } catch (err) {
            console.warn(
                "Greška pri učitavanju salona, koristim podrazumevane vrednosti:",
                err,
            );
            // Koristi podrazumevane vrednosti ako API nije dostupan
            setSalon(DEFAULT_SALON);
            if (!skipThemeApply) {
                applyTheme(DEFAULT_SALON);
            }
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [subdomain, skipThemeApply]);

    useEffect(() => {
        fetchSalon();

        // Slušaj događaj za osvežavanje podataka (nakon admin izmene)
        const handleRefresh = () => {
            fetchSalon();
        };
        window.addEventListener(SALON_REFRESH_EVENT, handleRefresh);

        return () => {
            window.removeEventListener(SALON_REFRESH_EVENT, handleRefresh);
        };
    }, [fetchSalon]);

    /**
     * Ručno ažuriraj salon (nakon admin izmene)
     */
    const updateSalon = async (salonData) => {
        const result = await salonService.update(salon.id, salonData);
        if (result.success) {
            // Ponovo učitaj podatke
            await fetchSalon();
        }
        return result;
    };

    return { salon, loading, error, updateSalon };
};

export default useSalonTheme;
