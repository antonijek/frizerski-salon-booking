import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

// ============================================
// Auth Context - upravljanje autentifikacijom
// ============================================

/**
 * Dekodiraj JWT payload (samo za čitanje, ne za verifikaciju)
 */
function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [switchedSalonId, setSwitchedSalonId] = useState(null);
    const [switchedSalonName, setSwitchedSalonName] = useState("");

    // Pri pokretanju proveri da li ima token u localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Proveri da li token sadrži switched context
            const decoded = decodeToken(token);
            if (decoded?.switchedSalonId) {
                setSwitchedSalonId(decoded.switchedSalonId);
                setSwitchedSalonName(decoded.switchedSalonName || "");
            }

            authService
                .getMe()
                .then((userData) => {
                    setUser(userData);
                })
                .catch(() => {
                    // Token nevažeći - očisti
                    localStorage.removeItem("token");
                    setUser(null);
                    setSwitchedSalonId(null);
                    setSwitchedSalonName("");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Prijava korisnika
     */
    const login = async (email, password) => {
        const data = await authService.login({ email, password });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setSwitchedSalonId(null);
        setSwitchedSalonName("");
        return data.user;
    };

    /**
     * Registracija korisnika
     */
    const register = async (name, email, password, phone) => {
        const data = await authService.register({
            name,
            email,
            password,
            phone,
        });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setSwitchedSalonId(null);
        setSwitchedSalonName("");
        return data.user;
    };

    /**
     * Odjava korisnika
     */
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setSwitchedSalonId(null);
        setSwitchedSalonName("");
    };

    /**
     * Super admin ulazi u konkretan salon (switch context)
     * @param {number} salonId - ID salona
     */
    const switchToSalon = async (salonId) => {
        const data = await authService.switchToSalon(salonId); // ovo ćemo dodati u authService
        localStorage.setItem("token", data.token);
        // Dekodiraj token da dobijemo switchedSalonName
        const decoded = decodeToken(data.token);
        setSwitchedSalonId(decoded?.switchedSalonId || salonId);
        setSwitchedSalonName(
            decoded?.switchedSalonName || data.salon?.name || "",
        );
        // User ostaje isti (super admin podaci)
        return data;
    };

    /**
     * Super admin se vraća iz režima konkretnog salona
     */
    const switchBack = async () => {
        const data = await authService.switchBack();
        localStorage.setItem("token", data.token);
        setSwitchedSalonId(null);
        setSwitchedSalonName("");
        return data;
    };

    const isSwitchedContext = switchedSalonId !== null;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                switchToSalon,
                switchBack,
                isAuthenticated: !!user,
                isAdmin: user?.isAdmin || false,
                isSuperAdmin: user?.isSuperAdmin || false,
                isSwitchedContext,
                switchedSalonId,
                switchedSalonName,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth mora biti koriscen unutar AuthProvider-a");
    }
    return context;
};

export default AuthContext;
