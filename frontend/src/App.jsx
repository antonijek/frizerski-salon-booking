import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import PageWrapper from "./components/common/PageWrapper";
import Notification from "./components/common/Notification";
import HomePage from "./components/HomePage";
import BookingForm from "./components/BookingForm";
import MyProfile from "./components/MyProfile";

// ============================================
// App - Glavna aplikacija
// ============================================

function App() {
    const [currentView, setCurrentView] = useState("/");

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const renderView = () => {
        switch (currentView) {
            case "/":
                return <HomePage onNavigate={handleNavigate} />;
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
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <AppProvider>
            <PageWrapper currentView={currentView} onNavigate={handleNavigate}>
                {renderView()}
            </PageWrapper>
            <Notification />
        </AppProvider>
    );
}

export default App;
