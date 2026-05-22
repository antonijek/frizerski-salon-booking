import requestInstance from "./requestInstance";

// ============================================
// Service Service - API pozivi za usluge
// ============================================

const serviceService = {
    /**
     * Dohvati sve usluge
     * @returns {Promise<Array>} Lista usluga
     */
    getAll: async () => {
        try {
            const response = await requestInstance.get("/services");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju usluga",
                }
            );
        }
    },

    /**
     * Kreiraj novu uslugu (admin)
     * @param {Object} serviceData
     * @returns {Promise<Object>}
     */
    create: async (serviceData) => {
        try {
            const response = await requestInstance.post(
                "/services",
                serviceData,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri kreiranju usluge",
                }
            );
        }
    },

    /**
     * Izmeni uslugu (admin)
     * @param {number} id
     * @param {Object} serviceData
     * @returns {Promise<Object>}
     */
    update: async (id, serviceData) => {
        try {
            const response = await requestInstance.put(
                `/services/${id}`,
                serviceData,
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: "Greška pri izmeni usluge" };
        }
    },

    /**
     * Obrisi uslugu (admin)
     * @param {number} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        try {
            const response = await requestInstance.delete(`/services/${id}`);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { error: "Greška pri brisanju usluge" }
            );
        }
    },
};

export default serviceService;
