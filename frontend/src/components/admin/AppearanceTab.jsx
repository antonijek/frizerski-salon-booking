import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import salonService from "../../services/salonService";
import { applyTheme, refreshSalonData } from "../../hooks/useSalonTheme";
import BasicInfoForm from "./appearance/BasicInfoForm";
import ContactInfoForm from "./appearance/ContactInfoForm";
import ImagesForm from "./appearance/ImagesForm";
import ColorsForm from "./appearance/ColorsForm";
import FontsForm from "./appearance/FontsForm";

// ============================================
// AppearanceTab - Izgled salona (admin)
// ============================================

const FONT_OPTIONS = [
    "Inter",
    "Playfair Display",
    "Montserrat",
    "Lora",
    "Oswald",
    "Roboto",
];

const DEFAULT_SALON = {
    name: "Frizerski Salon",
    short_name: "Salon",
    tagline: "Profesionalna nega vaše kose",
    description: "Dobrodošli u naš salon gde vaša kosa dobija najbolju negu.",
    logo_url: "",
    hero_image_url: "",
    phone: "+381 61 234 567",
    email: "info@salon.rs",
    address: "Ulica bb, Grad",
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

const MessageBanner = ({ message }) => {
    if (!message) return null;
    return (
        <div
            className={`p-4 rounded-xl text-sm font-medium ${
                message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
            {message.text}
        </div>
    );
};

const ActionButtons = ({ saving, onReset, onCancel }) => (
    <div className="flex justify-end gap-3">
        <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition"
        >
            ↩️ Vrati na podrazumevano
        </button>
        <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-neutral text-primary-dark rounded-xl font-medium hover:bg-primary-light transition"
        >
            Poništi
        </button>
        <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition disabled:opacity-50"
        >
            {saving ? "Čuvanje..." : "💾 Sačuvaj izgled"}
        </button>
    </div>
);

const AppearanceTab = () => {
    const { isSwitchedContext, switchedSalonId } = useAuth();
    const [form, setForm] = useState({ ...DEFAULT_SALON });
    const formRef = useRef(form);
    formRef.current = form;
    const [salonId, setSalonId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [heroUploadMode, setHeroUploadMode] = useState("url");
    const [heroSelectedFile, setHeroSelectedFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [heroUploading, setHeroUploading] = useState(false);
    const heroFileInputRef = useRef(null);

    /**
     * Odredi koji salon treba učitati na osnovu konteksta:
     * 1. Ako je super admin u switched contextu → koristi switchedSalonId
     * 2. Ako je običan admin → koristi subdomain iz URL-a
     * 3. Ako je super admin bez switched contexta → koristi subdomain iz URL-a
     */
    const detectTargetSalon = () => {
        if (isSwitchedContext && switchedSalonId) {
            return { type: "id", value: switchedSalonId };
        }
        // Detektuj subdomain iz hostname-a
        const hostname = window.location.hostname;
        // Ako je IP adresa (localhost, 127.0.0.1, ili bilo koja IP), koristi "main"
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
        ) {
            return { type: "subdomain", value: "main" };
        }
        const parts = hostname.split(".");
        if (parts.length >= 3 && parts[0] !== "www") {
            return { type: "subdomain", value: parts[0] };
        }
        return { type: "subdomain", value: "main" };
    };

    useEffect(() => {
        loadSalon();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSalon = async () => {
        setLoading(true);
        try {
            const target = detectTargetSalon();
            let data;
            if (target.type === "id") {
                data = await salonService.getById(target.value);
            } else {
                data = await salonService.get(target.value);
            }
            setSalonId(data.id);
            setForm({
                name: data.name || "",
                short_name: data.short_name || "",
                tagline: data.tagline || "",
                description: data.description || "",
                logo_url: data.logo_url || "",
                hero_image_url: data.hero_image_url || "",
                phone: data.phone || "",
                email: data.email || "",
                address: data.address || "",
                primary_color: data.primary_color || "#d97706",
                primary_hover: data.primary_hover || "#b45309",
                primary_light: data.primary_light || "#fffbeb",
                primary_bg_from: data.primary_bg_from || "#fef3c7",
                primary_bg_to: data.primary_bg_to || "#ffedd5",
                neutral_bg: data.neutral_bg || "#f9fafb",
                text_primary: data.text_primary || "#1f2937",
                text_secondary: data.text_secondary || "#6b7280",
                heading_font: data.heading_font || "Inter",
                body_font: data.body_font || "Inter",
            });
            // Primeni temu salona odmah, tako da se vide boje i fontovi trenutnog salona
            applyTheme(data);
        } catch (err) {
            console.error("Greška pri učitavanju salona:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Live-apply colors/fonts while user types
        // Use formRef.current to avoid stale closure (form may be outdated
        // when multiple rapid changes happen before React re-renders)
        if (
            name.startsWith("primary_") ||
            name.startsWith("text_") ||
            name === "neutral_bg" ||
            name === "heading_font" ||
            name === "body_font"
        ) {
            const preview = { ...formRef.current, [name]: value };
            applyTheme(preview);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const result = await salonService.update(salonId, form);
            if (result.success) {
                setMessage({
                    type: "success",
                    text: "Izgled salona uspešno sačuvan!",
                });
                applyTheme(form);
                refreshSalonData();
            } else {
                setMessage({
                    type: "error",
                    text: result.error || "Greška pri čuvanju",
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.error || "Greška pri čuvanju izgleda",
            });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleHeroFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setHeroSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setHeroPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleHeroUpload = async () => {
        if (!heroSelectedFile) return;

        setHeroUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("image", heroSelectedFile);

            const result = await salonService.heroUpload(formData);

            if (result.success && result.url) {
                setForm((prev) => ({ ...prev, hero_image_url: result.url }));
                setMessage({
                    type: "success",
                    text: "Hero slika uspešno uploadovana! Sačuvajte izgled da biste primenili promene.",
                });

                setHeroSelectedFile(null);
                setHeroPreview(null);
                if (heroFileInputRef.current) {
                    heroFileInputRef.current.value = "";
                }
            } else {
                setMessage({
                    type: "error",
                    text: result.error || "Greška pri uploadu hero slike",
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.error || "Greška pri uploadu hero slike",
            });
        } finally {
            setHeroUploading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleReset = async () => {
        if (
            !confirm(
                "Da li ste sigurni da želite da vratite na podrazumevane vrednosti? Ovo će sačuvati promene.",
            )
        )
            return;
        setForm({ ...DEFAULT_SALON });
        applyTheme(DEFAULT_SALON);
        setSaving(true);
        setMessage(null);
        try {
            const result = await salonService.update(salonId, DEFAULT_SALON);
            if (result.success) {
                setMessage({
                    type: "success",
                    text: "Izgled vraćen na podrazumevane vrednosti!",
                });
                refreshSalonData();
            } else {
                setMessage({
                    type: "error",
                    text: result.error || "Greška pri čuvanju",
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.error || "Greška pri čuvanju",
            });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-primary-light">Učitavanje podešavanja...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <MessageBanner message={message} />

            <BasicInfoForm form={form} handleChange={handleChange} />
            <ContactInfoForm form={form} handleChange={handleChange} />
            <ImagesForm
                form={form}
                handleChange={handleChange}
                heroUploadMode={heroUploadMode}
                heroSelectedFile={heroSelectedFile}
                heroPreview={heroPreview}
                heroUploading={heroUploading}
                heroFileInputRef={heroFileInputRef}
                onHeroFileSelect={handleHeroFileSelect}
                onHeroUpload={handleHeroUpload}
                onHeroModeChange={setHeroUploadMode}
            />
            <ColorsForm form={form} handleChange={handleChange} />
            <FontsForm
                form={form}
                handleChange={handleChange}
                fontOptions={FONT_OPTIONS}
            />

            <ActionButtons
                saving={saving}
                onReset={handleReset}
                onCancel={loadSalon}
            />
        </form>
    );
};

export default AppearanceTab;
