import axios from "axios";

// ============================================
// Axios instanca sa interceptorima
// ============================================

const API_BASE_URL = "/api";

const requestInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================
// REQUEST INTERCEPTOR - pre slanja zahteva
// ============================================
requestInstance.interceptors.request.use(
    (config) => {
        // Automatski dodaj JWT token u svaki zahtev
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ako šaljemo FormData, obriši Content-Type da axios sam postavi multipart/form-data
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error("[API] Request error:", error);
        return Promise.reject(error);
    },
);

// ============================================
// RESPONSE INTERCEPTOR - posle dobijanja odgovora
// ============================================
requestInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server je odgovorio sa greskom
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.warn("[API] Bad Request:", data.error);
                    break;
                case 404:
                    console.warn("[API] Not Found:", data.error);
                    break;
                case 409:
                    console.warn("[API] Conflict:", data.error);
                    break;
                case 500:
                    console.error("[API] Server Error:", data.error);
                    break;
                default:
                    console.error(`[API] Error ${status}:`, data.error);
            }
        } else if (error.request) {
            // Zahtev je poslat ali nema odgovora
            console.error("[API] Network error - server nije dostupan");
        } else {
            console.error("[API] Error:", error.message);
        }

        return Promise.reject(error);
    },
);

export default requestInstance;
