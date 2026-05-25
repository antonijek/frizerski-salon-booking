import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppointmentsTab from "./admin/AppointmentsTab";
import ServicesTab from "./admin/ServicesTab";
import BarbersTab from "./admin/BarbersTab";
import UsersTab from "./admin/UsersTab";
import StatsTab from "./admin/StatsTab";
import GalleryTab from "./admin/GalleryTab";

// ============================================
// AdminPanel - Administratorski panel
// ============================================

const AdminPanel = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("appointments");

    // Proveri da li je korisnik admin
    useEffect(() => {
        if (!user?.isAdmin) {
            onNavigate("/");
        }
    }, [user, onNavigate]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 text-sm">Upravljanje salonom</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{user?.name}</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                        Odjavi se
                    </button>
                </div>
            </div>

            {/* Tabovi */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab("appointments")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "appointments"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    📅 Termini
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "services"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    ✂️ Usluge
                </button>
                <button
                    onClick={() => setActiveTab("barbers")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "barbers"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    🧔 Frizeri
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "users"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    👥 Korisnici
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "stats"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    📊 Statistika
                </button>
                <button
                    onClick={() => setActiveTab("gallery")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeTab === "gallery"
                            ? "bg-amber-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    🖼️ Galerija
                </button>
            </div>

            {/* Sadržaj tabova */}
            {activeTab === "appointments" && <AppointmentsTab />}
            {activeTab === "services" && <ServicesTab />}
            {activeTab === "barbers" && <BarbersTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "stats" && <StatsTab />}
            {activeTab === "gallery" && <GalleryTab />}
        </div>
    );
};

export default AdminPanel;
