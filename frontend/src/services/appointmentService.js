import requestInstance from "./requestInstance";

// ============================================
// Appointment Service - svi API pozivi za termine
// ============================================

const appointmentService = {
    /**
     * Dohvati sve termine
     * @returns {Promise<Array>} Lista termina
     */
    getAll: async () => {
        try {
            const response = await requestInstance.get("/appointments");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju termina",
                }
            );
        }
    },

    /**
     * Dohvati termine za odredjeni datum
     * @param {string} date - Datum u formatu YYYY-MM-DD
     * @returns {Promise<Array>} Lista termina za taj datum
     */
    getByDate: async (date) => {
        try {
            const response = await requestInstance.get(
                `/appointments/date/${date}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju termina",
                }
            );
        }
    },

    /**
     * Dohvati termine za odredjeni datum i frizera
     * @param {string} date - Datum u formatu YYYY-MM-DD
     * @param {number} barberId - ID frizera
     * @returns {Promise<Array>} Lista termina za taj datum i frizera
     */
    getByDateAndBarber: async (date, barberId) => {
        try {
            const response = await requestInstance.get(
                `/appointments/date/${date}/barber/${barberId}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju termina",
                }
            );
        }
    },

    /**
     * Dohvati termine po broju telefona
     * @param {string} phone - Broj telefona
     * @returns {Promise<Array>} Lista termina za taj broj
     */
    getByPhone: async (phone) => {
        try {
            const response = await requestInstance.get(
                `/appointments/phone/${encodeURIComponent(phone)}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju termina",
                }
            );
        }
    },

    /**
     * Kreiraj novi termin
     * @param {Object} appointmentData - Podaci o terminu
     * @param {string} appointmentData.name - Ime i prezime
     * @param {string} appointmentData.phone - Broj telefona
     * @param {string} [appointmentData.email] - Email (opciono)
     * @param {string} appointmentData.date - Datum YYYY-MM-DD
     * @param {string} appointmentData.time - Vreme HH:mm
     * @param {string} appointmentData.service - Naziv usluge
     * @returns {Promise<Object>} Kreirani termin
     */
    create: async (appointmentData) => {
        try {
            const response = await requestInstance.post(
                "/appointments",
                appointmentData,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri kreiranju termina",
                }
            );
        }
    },

    /**
     * Izmeni termin
     * @param {number} id - ID termina
     * @param {Object} appointmentData - Podaci o terminu
     * @returns {Promise<Object>} Poruka o uspehu
     */
    update: async (id, appointmentData) => {
        try {
            const response = await requestInstance.put(
                `/appointments/${id}`,
                appointmentData,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { error: "Greška pri izmeni termina" }
            );
        }
    },

    /**
     * Obrisi termin
     * @param {number} id - ID termina
     * @returns {Promise<Object>} Poruka o uspehu
     */
    delete: async (id) => {
        try {
            const response = await requestInstance.delete(
                `/appointments/${id}`,
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { error: "Greška pri brisanju termina" }
            );
        }
    },

    /**
     * Dohvati statistiku (samo admin)
     * @returns {Promise<Object>} Statistički podaci
     */
    getStats: async () => {
        try {
            const response = await requestInstance.get("/appointments/stats");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    error: "Greška pri dohvatanju statistike",
                }
            );
        }
    },
};

export default appointmentService;
