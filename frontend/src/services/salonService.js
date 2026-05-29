import requestInstance from "./requestInstance";

// ============================================
// Salon Service - API pozivi za salon (multi-tenant)
// ============================================

const salonService = {
    /**
     * Dohvati salon po subdomain-u (ili podrazumevani)
     * @param {string} subdomain - Subdomain (npr. "main")
     * @returns {Promise<Object>} Podaci o salonu
     */
    get: async (subdomain = "main") => {
        try {
            const response = await requestInstance.get(
                `/salons?subdomain=${subdomain}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju salona",
                }
            );
        }
    },

    /**
     * Dohvati salon po ID-u
     * @param {number} id - ID salona
     * @returns {Promise<Object>} Podaci o salonu
     */
    getById: async (id) => {
        try {
            const response = await requestInstance.get(`/salons/${id}`);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju salona po ID-u",
                }
            );
        }
    },

    /**
     * Dohvati sve salone (admin)
     * @returns {Promise<Array>} Lista salona
     */
    getAll: async () => {
        try {
            const response = await requestInstance.get("/salons/all");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju salona",
                }
            );
        }
    },

    /**
     * Kreiraj novi salon (admin)
     * @param {Object} salonData - { subdomain, name, short_name }
     * @returns {Promise<Object>}
     */
    create: async (salonData) => {
        try {
            const response = await requestInstance.post("/salons", salonData);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri kreiranju salona",
                }
            );
        }
    },

    /**
     * Izmeni salon (admin)
     * @param {number} id - ID salona
     * @param {Object} salonData - Podaci za izmenu
     * @returns {Promise<Object>}
     */
    update: async (id, salonData) => {
        try {
            const response = await requestInstance.put(
                `/salons/${id}`,
                salonData,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri izmeni salona",
                }
            );
        }
    },

    /**
     * Obriši salon (admin)
     * @param {number} id - ID salona
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        try {
            const response = await requestInstance.delete(`/salons/${id}`);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri brisanju salona",
                }
            );
        }
    },

    /**
     * Upload hero slike (admin)
     * @param {FormData} formData - FormData sa fajlom (ključ: "image")
     * @returns {Promise<Object>} { success, url, message }
     */
    heroUpload: async (formData) => {
        try {
            const response = await requestInstance.post(
                "/salons/hero-upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri uploadu hero slike",
                }
            );
        }
    },

    /**
     * Dohvati sve korisnike (samo super admin)
     * @returns {Promise<Array>} Lista korisnika
     */
    getAllUsers: async () => {
        try {
            const response = await requestInstance.get(
                "/auth/super-admin/users",
            );
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
     * Postavi korisnika kao super admin (samo super admin)
     * @param {string} email - Email korisnika
     * @returns {Promise<Object>}
     */
    makeSuperAdmin: async (email) => {
        try {
            const response = await requestInstance.post(
                "/auth/make-super-admin",
                { email },
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri postavljanju super admina",
                }
            );
        }
    },

    /**
     * Super admin ulazi u konkretan salon (switch context)
     * @param {number} salonId - ID salona u koji se ulazi
     * @returns {Promise<Object>} { token, salon, message }
     */
    enterSalon: async (salonId) => {
        try {
            const response = await requestInstance.post(
                `/auth/switch-salon/${salonId}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri prelasku u salon",
                }
            );
        }
    },

    /**
     * Super admin se vraća iz režima konkretnog salona
     * @returns {Promise<Object>} { token, message }
     */
    switchBack: async () => {
        try {
            const response = await requestInstance.post("/auth/switch-back");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri vraćanju u super admin režim",
                }
            );
        }
    },
};

export default salonService;
