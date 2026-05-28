/**
 * Convert "HH:MM" to total minutes since midnight.
 * @param {string} time - Time string in "HH:MM" format
 * @returns {number} Total minutes
 */
export const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Convert total minutes since midnight to "HH:MM" format.
 * @param {number} minutes - Total minutes
 * @returns {string} Time string in "HH:MM" format
 */
export const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
