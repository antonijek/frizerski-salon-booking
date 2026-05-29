import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import PageWrapper from "./components/common/PageWrapper";
import Notification from "./components/common/Notification";
import HomePage from "./components/HomePage";
import ServicesPage from "./components/ServicesPage";
import ContactPage from "./components/ContactPage";
import BookingForm from "./components/BookingForm";
import MyProfile from "./components/MyProfile";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import Team from "./components/common/Team";
import useSalonTheme from "./hooks/useSalonTheme";

// ============================================
// App - Glavna aplikacija
// ============================================

/**
 * Detektuj subdomain iz URL-a (hostname)
 * @returns {string} subdomain (npr. "feniks", "main")
 */
function detectSubdomain() {
    try {
        const hostname = window.location.hostname;
        // Ako je localhost ili IP, vrati "main"
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
        ) {
            return "main";
        }
        const parts = hostname.split(".");
        // Ako ima barem 3 dela (npr. feniks.nesto.rs), uzmi prvi deo kao subdomain
        if (parts.length >= 3 && parts[0] !== "www") {
            return parts[0];
        }
        return "main";
    } catch {
        return "main";
    }
}

function App() {
    const [currentView, setCurrentView] = useState("/");
    const subdomain = detectSubdomain();
    // Na admin panelu ne primenjujemo automatski temu jer
    // AppearanceTab sam upravlja temom (posebno u switched context režimu)
    const skipThemeApply = currentView === "/admin";
    const { salon, loading } = useSalonTheme(subdomain, skipThemeApply);

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const renderView = () => {
        switch (currentView) {
            case "/":
                return <HomePage onNavigate={handleNavigate} salon={salon} />;
            case "/usluge":
                return <ServicesPage />;
            case "/tim":
                return <Team />;
            case "/kontakt":
                return <ContactPage />;
            case "/zakazi":
                return (
                    <div className="max-w-lg mx-auto px-4 py-12">
                        <BookingForm onNavigate={handleNavigate} />
                    </div>
                );
            case "/moj-profil":
                return (
                    <div className="max-w-2xl mx-auto px-4 py-12">
                        <MyProfile />
                    </div>
                );
            case "/login":
                return <Login onNavigate={handleNavigate} />;
            case "/register":
                return <Register onNavigate={handleNavigate} />;
            case "/admin":
                return <AdminPanel onNavigate={handleNavigate} />;
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <AuthProvider>
            <AppProvider>
                <PageWrapper
                    currentView={currentView}
                    onNavigate={handleNavigate}
                    salon={salon}
                    loading={loading}
                >
                    {renderView()}
                </PageWrapper>
                <Notification />
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
