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

    /**
     * Dohvati sve registrovane korisnike (samo admin)
     * @returns {Promise<Array>} Lista korisnika
     */
    getUsers: async () => {
        try {
            const response = await requestInstance.get("/auth/users");
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
     * Izmeni korisnika (samo admin)
     * @param {number} id - ID korisnika
     * @param {Object} data - { name, email, phone, is_admin }
     * @returns {Promise<Object>}
     */
    updateUser: async (id, data) => {
        try {
            const response = await requestInstance.put(
                `/auth/users/${id}`,
                data,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri izmeni korisnika",
                }
            );
        }
    },

    /**
     * Obriši korisnika (samo admin)
     * @param {number} id - ID korisnika
     * @returns {Promise<Object>}
     */
    deleteUser: async (id) => {
        try {
            const response = await requestInstance.delete(`/auth/users/${id}`);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri brisanju korisnika",
                }
            );
        }
    },
};

export default authService;
