import requestInstance from "../services/requestInstance";

const apiCall = {
    get: async (
        url,
        params = {},
        errorMsg = "Greška pri dohvatanju podataka",
    ) => {
        try {
            const response = await requestInstance.get(url, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: errorMsg };
        }
    },

    post: async (url, data, errorMsg = "Greška pri kreiranju") => {
        try {
            const response = await requestInstance.post(url, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: errorMsg };
        }
    },

    put: async (url, data, errorMsg = "Greška pri izmeni") => {
        try {
            const response = await requestInstance.put(url, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: errorMsg };
        }
    },

    delete: async (url, errorMsg = "Greška pri brisanju") => {
        try {
            const response = await requestInstance.delete(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: errorMsg };
        }
    },
};

export default apiCall;
