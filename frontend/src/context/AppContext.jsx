import { createContext, useContext, useState, useCallback } from "react";

// ============================================
// AppContext - globalno stanje aplikacije
// ============================================

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [currentView, setCurrentView] = useState("home");

    /**
     * Prikazi notifikaciju
     * @param {string} message - Poruka
     * @param {'success'|'error'|'info'|'warning'} type - Tip notifikacije
     * @param {number} duration - Trajanje u ms (default 3000)
     */
    const showNotification = useCallback(
        (message, type = "info", duration = 3000) => {
            setNotification({ message, type });

            if (duration > 0) {
                setTimeout(() => {
                    setNotification(null);
                }, duration);
            }
        },
        [],
    );

    /**
     * Sakrij notifikaciju
     */
    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const value = {
        notification,
        showNotification,
        hideNotification,
        currentView,
        setCurrentView,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook za koriscenje AppContext-a
 */
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error(
            "useAppContext mora biti koriscen unutar AppProvider-a",
        );
    }
    return context;
};

export default AppContext;
