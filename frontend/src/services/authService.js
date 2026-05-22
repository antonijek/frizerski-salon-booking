import requestInstance from "./requestInstance";

// ============================================
// Auth Service - API pozivi za autentifikaciju
// ============================================

const authService = {
    /**
     * Registracija novog korisnika
     * @param {Object} data - { name, email, password, phone }
     * @returns {Promise<Object>} { token, user }
     */
    register: async (data) => {
        try {
            const response = await requestInstance.post("/auth/register", data);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri registraciji",
                }
            );
        }
    },

    /**
     * Prijava korisnika
     * @param {Object} data - { email, password }
     * @returns {Promise<Object>} { token, user }
     */
    login: async (data) => {
        try {
            const response = await requestInstance.post("/auth/login", data);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri prijavi",
                }
            );
        }
    },

    /**
     * Dohvati podatke o trenutnom korisniku
     * @returns {Promise<Object>} user
     */
    getMe: async () => {
        try {
            const response = await requestInstance.get("/auth/me");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju korisnika",
                }
            );
        }
    },

    /**
     * Postavi korisnika za admina
     * @param {string} email - Email korisnika
     * @returns {Promise<Object>}
     */
    makeAdmin: async (email) => {
        try {
            const response = await requestInstance.post("/auth/make-admin", {
                email,
            });
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dodeli admin prava",
                }
            );
        }
    },
};

export default authService;
