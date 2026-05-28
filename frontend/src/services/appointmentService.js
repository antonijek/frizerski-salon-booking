import apiCall from "../utils/apiCall";

// ============================================
// Appointment Service - svi API pozivi za termine
// ============================================

const appointmentService = {
    getAll: () =>
        apiCall.get("/appointments", {}, "Greška pri dohvatanju termina"),

    getByDate: (date) =>
        apiCall.get(
            `/appointments/date/${date}`,
            {},
            "Greška pri dohvatanju termina",
        ),

    getByDateAndBarber: (date, barberId) =>
        apiCall.get(
            `/appointments/date/${date}/barber/${barberId}`,
            {},
            "Greška pri dohvatanju termina",
        ),

    getByPhone: (phone) =>
        apiCall.get(
            `/appointments/phone/${encodeURIComponent(phone)}`,
            {},
            "Greška pri dohvatanju termina",
        ),

    create: (appointmentData) =>
        apiCall.post(
            "/appointments",
            appointmentData,
            "Greška pri kreiranju termina",
        ),

    update: (id, appointmentData) =>
        apiCall.put(
            `/appointments/${id}`,
            appointmentData,
            "Greška pri izmeni termina",
        ),

    delete: (id) =>
        apiCall.delete(`/appointments/${id}`, "Greška pri brisanju termina"),

    getStats: (filters = {}) => {
        const params = {};
        if (filters.period && filters.period !== "all") {
            params.period = filters.period;
        }
        if (filters.start_date) {
            params.start_date = filters.start_date;
        }
        if (filters.end_date) {
            params.end_date = filters.end_date;
        }
        return apiCall.get(
            "/appointments/stats",
            params,
            "Greška pri dohvatanju statistike",
        );
    },
};

export default appointmentService;
