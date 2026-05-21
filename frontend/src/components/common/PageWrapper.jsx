import salonConfig from "../../config/salonConfig";

// ============================================
// PageWrapper - wrapper za celu stranicu
// ============================================

const PageWrapper = ({ children, currentView, onNavigate }) => {
    const { name, tagline, navigation, footer } = salonConfig;

    const handleNavClick = (path) => {
        // Usluge i Kontakt su sekcije na pocetnoj strani - skrolujemo
        if (path === "/usluge" || path === "/kontakt") {
            onNavigate("/");
            // Sacekamo da se HomePage renderuje pa skrolujemo
            setTimeout(() => {
                const el = document.getElementById(path.replace("/", ""));
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } else {
            onNavigate(path);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
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
                        </div>

                        {/* Mobile menu - samo ikonice */}
                        <div className="flex md:hidden items-center gap-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`p-2 rounded-lg transition text-lg ${
                                        currentView === item.path
                                            ? "bg-amber-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    title={item.label}
                                >
                                    {item.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
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
