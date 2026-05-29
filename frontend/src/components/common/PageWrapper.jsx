import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import salonConfig from "../../config/salonConfig";

// ============================================
// PageWrapper - wrapper za celu stranicu
// ============================================

const PageWrapper = ({ children, currentView, onNavigate, salon }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { navigation, footer } = salonConfig;

    // Koristi dinamičke podatke iz baze, ili podrazumevane iz salonConfig
    const name = salon?.name || salonConfig.name;
    const tagline = salon?.tagline || salonConfig.tagline;
    const contact = {
        phone: salon?.phone || salonConfig.contact.phone,
        email: salon?.email || salonConfig.contact.email,
        address: salon?.address || salonConfig.contact.address,
    };

    const { isAuthenticated, isAdmin, logout } = useAuth();

    const handleNavClick = (path) => {
        setMobileMenuOpen(false);
        onNavigate(path);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-primary flex flex-col overflow-x-hidden">
            {/* Navigacija */}
            <nav className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onNavigate("/")}
                        >
                            {salon?.logo_url ? (
                                <img
                                    src={salon.logo_url}
                                    alt={name}
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                <span className="text-3xl">✂️</span>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-primary-dark">
                                    {name}
                                </h1>
                                <p className="text-xs text-primary-light -mt-1">
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
                                            ? "bg-primary text-white"
                                            : "text-primary-dark hover:bg-primary-light"
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
                                                    ? "bg-primary text-white"
                                                    : "text-primary-dark hover:bg-primary-light"
                                            }`}
                                        >
                                            🔧 Admin
                                        </button>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 rounded-lg transition text-sm font-medium text-primary-dark hover:bg-primary-light"
                                    >
                                        🚪 Odjavi se
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => onNavigate("/login")}
                                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                        currentView === "/login"
                                            ? "bg-primary text-white"
                                            : "text-primary-dark hover:bg-primary-light"
                                    }`}
                                >
                                    🔑 Prijava
                                </button>
                            )}
                        </div>

                        {/* Hamburger dugme - mobilni */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-primary-dark hover:bg-primary-light transition text-2xl"
                            aria-label="Meni"
                        >
                            {mobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobilni meni - dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-primary-light bg-white shadow-lg">
                        <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                        currentView === item.path
                                            ? "bg-primary text-white"
                                            : "text-primary-dark hover:bg-primary-light"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            <hr className="border-primary-light my-2" />

                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={() =>
                                                handleNavClick("/admin")
                                            }
                                            className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                                currentView === "/admin"
                                                    ? "bg-primary text-white"
                                                    : "text-primary-dark hover:bg-primary-light"
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
                                        className="w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 text-primary-dark hover:bg-primary-light"
                                    >
                                        <span className="text-lg">🚪</span>
                                        Odjavi se
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleNavClick("/login")}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center gap-3 ${
                                        currentView === "/login"
                                            ? "bg-primary text-white"
                                            : "text-primary-dark hover:bg-primary-light"
                                    }`}
                                >
                                    <span className="text-lg">🔑</span>
                                    Prijava
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Glavni sadrzaj */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-primary text-white mt-auto">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">
                                {name}
                            </h3>
                            <p className="text-white/80 text-sm">{tagline}</p>
                        </div>

                        {/* Kontakt */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">
                                Kontakt
                            </h3>
                            <div className="space-y-2 text-sm text-white/80">
                                <p>📞 {contact.phone}</p>
                                <p>📧 {contact.email}</p>
                                <p>📍 {contact.address}</p>
                            </div>
                        </div>

                        {/* Radno vreme */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">
                                Radno vreme
                            </h3>
                            <div className="space-y-1 text-sm text-white/80">
                                <p>Pon - Pet: 09:00 - 17:00</p>
                                <p>Sub: 09:00 - 15:00</p>
                                <p>Ned: Zatvoreno</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/60">
                        {footer.copyright}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PageWrapper;
