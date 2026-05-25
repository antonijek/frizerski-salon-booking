import request from "./requestInstance";

const API_URL = "/gallery";

const galleryService = {
    /**
     * Dohvati sve slike iz galerije
     */
    async getAll() {
        const response = await request.get(API_URL);
        // Transformiši src da koristi pun URL ako je relativna putanja
        return response.data.map((img) => ({
            ...img,
            src: img.src.startsWith("http")
                ? img.src
                : `http://localhost:5000${img.src}`,
        }));
    },

    /**
     * Dodaj novu sliku uploadom fajla (admin)
     */
    async upload(data) {
        const response = await request.post(`${API_URL}/upload`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /**
     * Dodaj novu sliku putem URL-a (admin)
     */
    async addByUrl(data) {
        const response = await request.post(`${API_URL}/url`, data);
        return response.data;
    },

    /**
     * Obriši sliku (admin)
     */
    async delete(id) {
        const response = await request.delete(`${API_URL}/${id}`);
        return response.data;
    },
};

export default galleryService;
