import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppointmentsTab from "./admin/AppointmentsTab";
import ServicesTab from "./admin/ServicesTab";
import BarbersTab from "./admin/BarbersTab";
import UsersTab from "./admin/UsersTab";
import StatsTab from "./admin/StatsTab";
import GalleryTab from "./admin/GalleryTab";
import AppearanceTab from "./admin/AppearanceTab";
import SaloniTab from "./admin/SaloniTab";

// ============================================
// AdminPanel - Administratorski panel
// ============================================

const AdminPanel = ({ onNavigate }) => {
    const {
        user,
        logout,
        isSuperAdmin,
        isSwitchedContext,
        switchedSalonName,
        switchBack,
        switchedSalonId,
    } = useAuth();
    const [activeTab, setActiveTab] = useState("appointments");
    const [switchingBack, setSwitchingBack] = useState(false);

    // Kad se prebacimo na salon, automatski prebaci na Termini tab
    useEffect(() => {
        if (isSwitchedContext && activeTab === "salons") {
            setActiveTab("appointments");
        }
    }, [isSwitchedContext, activeTab]);

    // Proveri da li je korisnik admin
    useEffect(() => {
        if (!user?.isAdmin) {
            onNavigate("/");
        }
    }, [user, onNavigate]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Switch Context Banner */}
            {isSwitchedContext && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔀</span>
                            <div>
                                <p className="text-white font-medium text-sm">
                                    Režim pregleda salona:{" "}
                                    <span className="font-bold">
                                        {switchedSalonName ||
                                            `Salon #${switchedSalonId}`}
                                    </span>
                                </p>
                                <p className="text-purple-200 text-xs mt-0.5">
                                    Pregledate podatke kao da ste admin ovog
                                    salona. Vratite se na Super Admin režim da
                                    biste videli sve salone.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                setSwitchingBack(true);
                                try {
                                    await switchBack();
                                } catch (err) {
                                    console.error("Greška pri vraćanju:", err);
                                } finally {
                                    setSwitchingBack(false);
                                }
                            }}
                            disabled={switchingBack}
                            className="px-5 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {switchingBack
                                ? "Vraćanje..."
                                : "⬅ Vrati se na Super Admin"}
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">
                        Admin Panel
                    </h1>
                    <p className="text-primary-light text-sm">
                        Upravljanje salonom
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-primary-light">
                        {user?.name}
                    </span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-neutral text-primary-dark rounded-lg hover:bg-primary-light transition text-sm"
                    >
                        Odjavi se
                    </button>
                </div>
            </div>

            {/* Tabovi */}
            <div className="flex gap-2 mb-6 border-b border-primary-light pb-2 flex-wrap">
                <button
                    onClick={() => setActiveTab("appointments")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "appointments"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    📅 Termini
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "services"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    ✂️ Usluge
                </button>
                <button
                    onClick={() => setActiveTab("barbers")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "barbers"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    🧔 Frizeri
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "users"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    👥 Korisnici
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "stats"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    📊 Statistika
                </button>
                <button
                    onClick={() => setActiveTab("gallery")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "gallery"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    🖼️ Galerija
                </button>
                <button
                    onClick={() => setActiveTab("appearance")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "appearance"
                            ? "bg-primary text-white"
                            : "text-primary-light hover:bg-primary-light"
                    }`}
                >
                    🎨 Izgled
                </button>
                {isSuperAdmin && !isSwitchedContext && (
                    <button
                        onClick={() => setActiveTab("salons")}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                            activeTab === "salons"
                                ? "bg-primary text-white"
                                : "text-primary-light hover:bg-primary-light"
                        }`}
                    >
                        🏢 Saloni
                    </button>
                )}
            </div>

            {/* Sadržaj tabova */}
            {activeTab === "appointments" && (
                <AppointmentsTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "services" && (
                <ServicesTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "barbers" && (
                <BarbersTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "users" && (
                <UsersTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "stats" && (
                <StatsTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "gallery" && (
                <GalleryTab key={switchedSalonId || "default"} />
            )}
            {activeTab === "appearance" && (
                <AppearanceTab key={switchedSalonId || "default"} />
            )}
            {isSuperAdmin && !isSwitchedContext && activeTab === "salons" && (
                <SaloniTab />
            )}
        </div>
    );
};

export default AdminPanel;
