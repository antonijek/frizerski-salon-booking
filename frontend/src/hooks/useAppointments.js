import { useState } from "react";
import appointmentService from "../services/appointmentService";

// ============================================
// Hook za upravljanje terminima
// ============================================

const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Dohvati sve termine
     */
    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (err) {
            setError(err.error || "Greška pri dohvatanju termina");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Dohvati termine za odredjeni datum
     * @param {string} date - Datum YYYY-MM-DD
     */
    const fetchByDate = async (date) => {
        if (!date) {
            fetchAll();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await appointmentService.getByDate(date);
            setAppointments(data);
        } catch (err) {
            setError(err.error || "Greška pri dohvatanju termina");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Dohvati termine po broju telefona
     * @param {string} phone - Broj telefona
     */
    const fetchByPhone = async (phone) => {
        if (!phone) {
            setAppointments([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await appointmentService.getByPhone(phone);
            setAppointments(data);
        } catch (err) {
            setError(err.error || "Greška pri dohvatanju termina");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Kreiraj novi termin
     * @param {Object} appointmentData
     * @returns {Promise<Object>} { success, message }
     */
    const create = async (appointmentData) => {
        setError(null);
        try {
            const result = await appointmentService.create(appointmentData);
            return {
                success: true,
                message: "🎉 Termin uspešno zakazan!",
                data: result,
            };
        } catch (err) {
            const errorMsg = err.error || "Greška pri kreiranju termina";
            setError(errorMsg);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Izmeni termin
     * @param {number} id
     * @param {Object} appointmentData
     * @returns {Promise<Object>} { success, message }
     */
    const update = async (id, appointmentData) => {
        setError(null);
        try {
            await appointmentService.update(id, appointmentData);
            // Azuriraj lokalno stanje
            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === id ? { ...a, ...appointmentData } : a,
                ),
            );
            return {
                success: true,
                message: "Termin uspešno izmenjen",
            };
        } catch (err) {
            const errorMsg = err.error || "Greška pri izmeni termina";
            setError(errorMsg);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Obrisi termin
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    const remove = async (id) => {
        setError(null);
        try {
            await appointmentService.delete(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            return true;
        } catch (err) {
            setError(err.error || "Greška pri brisanju termina");
            return false;
        }
    };

    return {
        appointments,
        loading,
        error,
        fetchAll,
        fetchByDate,
        fetchByPhone,
        create,
        update,
        remove,
    };
};

export default useAppointments;
