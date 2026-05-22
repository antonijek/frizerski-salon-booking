import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

// ============================================
// Auth Context - upravljanje autentifikacijom
// ============================================

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pri pokretanju proveri da li ima token u localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            authService
                .getMe()
                .then((userData) => {
                    setUser(userData);
                })
                .catch(() => {
                    // Token nevažeći - očisti
                    localStorage.removeItem("token");
                    setUser(null);
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
        return data.user;
    };

    /**
     * Odjava korisnika
     */
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isAdmin: user?.isAdmin || false,
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
