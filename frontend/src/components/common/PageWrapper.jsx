import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import salonConfig from "../../config/salonConfig";
import authService from "../../services/authService";

// ============================================
// PageWrapper - wrapper za celu stranicu
// ============================================

const PageWrapper = ({ children, currentView, onNavigate }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [makingAdmin, setMakingAdmin] = useState(false);
    const { name, tagline, navigation, footer } = salonConfig;
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    const handleMakeAdmin = async () => {
        if (!user?.email) return;
        setMakingAdmin(true);
        try {
            await authService.makeAdmin(user.email);
            alert(
                "✅ Postali ste admin! Odjavite se i ponovo prijavite da bi promene stupile na snagu.",
            );
        } catch (err) {
            alert("❌ " + (err.error || "Greška pri dodeli admin prava"));
        }
        setMakingAdmin(false);
    };

    const handleNavClick = (path) => {
        setMobileMenuOpen(false);
        onNavigate(path);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col overflow-x-hidden">
            {/* Navigacija */}
            <nav className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onNavigate("/")}
                        >
                            <span className="text-3xl">✂️</span>
                            <div>
                                <h1 className="text-xl font-bold text-amber-800">
                                    {name}
                                </h1>
                                <p className="text-xs text-gray-500 -mt-1">
                                    {tagline}
                                </p>
                            </div>
                        </div>

                        {/* Navigacija - desktop */}
                        <div className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                        currentView === item.path
                                            ? "bg-amber-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="mr-1">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            {/* Auth dugmad */}
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={() => onNavigate("/admin")}
                                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                                currentView === "/admin"
                                                    ? "bg-amber-600 text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            🔧 Admin
                                        </button>
                                    )}
                                    {!isAdmin && (
                                        <button
                                            onClick={handleMakeAdmin}
                                            disabled={makingAdmin}
                                            className="px-4 py-2 rounded-lg transition text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            {makingAdmin
                                                ? "..."
                                                : "👑 Postani admin"}
                                        </button>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 rounded-lg transition text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        🚪 Odjavi se
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onNavigate("/login")}
                                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                            currentView === "/login"
                                                ? "bg-amber-600 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        🔑 Prijava
                                    </button>
                                    <button
                                        onClick={() => onNavigate("/register")}
                                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                            currentView === "/register"
                                                ? "bg-amber-600 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        📝 Registracija
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Hamburger dugme - mobilni */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition text-2xl"
                            aria-label="Meni"
                        >
                            {mobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobilni meni - dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
                        <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                        currentView === item.path
                                            ? "bg-amber-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            <hr className="border-gray-100 my-2" />

                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={() =>
                                                handleNavClick("/admin")
                                            }
                                            className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                                currentView === "/admin"
                                                    ? "bg-amber-600 text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-lg">🔧</span>
                                            Admin panel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            closeMobileMenu();
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                                    >
                                        <span className="text-lg">🚪</span>
                                        Odjavi se
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleNavClick("/login")}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                            currentView === "/login"
                                                ? "bg-amber-600 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span className="text-lg">🔑</span>
                                        Prijava
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleNavClick("/register")
                                        }
                                        className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                            currentView === "/register"
                                                ? "bg-amber-600 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span className="text-lg">📝</span>
                                        Registracija
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Glavni sadrzaj */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white mt-auto">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">
                                {name}
                            </h3>
                            <p className="text-gray-400 text-sm">{tagline}</p>
                        </div>

                        {/* Kontakt */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">
                                Kontakt
                            </h3>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>📞 {salonConfig.contact.phone}</p>
                                <p>📧 {salonConfig.contact.email}</p>
                                <p>📍 {salonConfig.contact.address}</p>
                            </div>
                        </div>

                        {/* Radno vreme */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">
                                Radno vreme
                            </h3>
                            <div className="space-y-1 text-sm text-gray-400">
                                <p>Pon - Pet: 09:00 - 17:00</p>
                                <p>Sub: 09:00 - 15:00</p>
                                <p>Ned: Zatvoreno</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
                        {footer.copyright}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PageWrapper;
