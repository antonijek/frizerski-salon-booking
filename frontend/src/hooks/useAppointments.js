import { useState, useEffect, useCallback } from "react";
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
    const fetchAll = useCallback(async () => {
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
    }, []);

    /**
     * Dohvati termine za odredjeni datum
     * @param {string} date - Datum YYYY-MM-DD
     */
    const fetchByDate = useCallback(
        async (date) => {
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
        },
        [fetchAll],
    );

    /**
     * Dohvati termine po broju telefona
     * @param {string} phone - Broj telefona
     */
    const fetchByPhone = useCallback(async (phone) => {
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
    }, []);

    /**
     * Kreiraj novi termin
     * @param {Object} appointmentData
     * @returns {Promise<Object>} { success, message }
     */
    const create = useCallback(async (appointmentData) => {
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
    }, []);

    /**
     * Izmeni termin
     * @param {number} id
     * @param {Object} appointmentData
     * @returns {Promise<Object>} { success, message }
     */
    const update = useCallback(async (id, appointmentData) => {
        setError(null);
        try {
            await appointmentService.update(id, appointmentData);
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
    }, []);

    /**
     * Obrisi termin
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    const remove = useCallback(async (id) => {
        setError(null);
        try {
            await appointmentService.delete(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            return true;
        } catch (err) {
            setError(err.error || "Greška pri brisanju termina");
            return false;
        }
    }, []);

    // Ucitaj termine na mount
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

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
