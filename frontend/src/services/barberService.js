import request from "./requestInstance";

const API_URL = "/barbers";

const barberService = {
    /**
     * Dohvati sve aktivne frizere
     */
    async getAll() {
        const response = await request.get(API_URL);
        return response.data;
    },

    /**
     * Dohvati sve frizere (admin)
     */
    async getAllAdmin() {
        const response = await request.get(`${API_URL}/all`);
        return response.data;
    },

    /**
     * Kreiraj novog frizera (admin)
     */
    async create(name) {
        const response = await request.post(API_URL, { name });
        return response.data;
    },

    /**
     * Izmeni frizera (admin)
     */
    async update(id, data) {
        const response = await request.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Obriši frizera (admin)
     */
    async delete(id) {
        const response = await request.delete(`${API_URL}/${id}`);
        return response.data;
    },
};

export default barberService;
