import { useState } from "react";

// ============================================
// Hook za upravljanje formom i validacijom
// ============================================

const useForm = (initialValues, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    /**
     * Validiraj jedno polje
     * @param {string} name - Ime polja
     * @param {*} value - Vrednost polja
     * @returns {string|null} - Poruka o gresci ili null
     */
    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return null;

        for (const rule of rules) {
            if (rule.required && (!value || value === "")) {
                return rule.message || "Ovo polje je obavezno";
            }
            if (rule.minLength && value && value.length < rule.minLength) {
                return rule.message || `Minimum ${rule.minLength} karaktera`;
            }
            if (rule.pattern && value && !rule.pattern.test(value)) {
                return rule.message || "Neispravan format";
            }
            if (rule.custom) {
                const customError = rule.custom(value, values);
                if (customError) return customError;
            }
        }
        return null;
    };

    /**
     * Promeni vrednost polja
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));

        // Validiraj polje ako je vec touched
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    /**
     * Oznaci polje kao touched (na blur)
     */
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    /**
     * Validiraj sva polja
     * @returns {boolean} - Da li forma ima gresaka
     */
    const validateAll = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach((name) => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(
            Object.keys(validationRules).reduce(
                (acc, key) => ({ ...acc, [key]: true }),
                {},
            ),
        );

        return isValid;
    };

    /**
     * Resetuj formu
     */
    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    /**
     * Postavi vrednosti (npr. iz API odgovora)
     */
    const setValuesManually = (newValues) => {
        setValues((prev) => ({ ...prev, ...newValues }));
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
        setValues: setValuesManually,
        isValid: Object.keys(errors).length === 0,
    };
};

export default useForm;
