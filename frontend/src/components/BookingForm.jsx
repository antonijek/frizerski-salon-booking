import { useState, useEffect } from "react";
import salonConfig from "../config/salonConfig";
import useForm from "../hooks/useForm";
import useAppointments from "../hooks/useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import serviceService from "../services/serviceService";

// ============================================
// BookingForm - Forma za zakazivanje termina
// ============================================

// Helper funkcije za konverziju vremena
const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const BookingForm = ({ onNavigate }) => {
    const { showNotification } = useAppContext();
    const { create } = useAppointments();
    const { user, isAuthenticated } = useAuth();
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProfilePrompt, setShowProfilePrompt] = useState(false);
    const [services, setServices] = useState([]);

    const { workingHours, booking } = salonConfig;

    // Ucitaj usluge iz baze
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await serviceService.getAll();
                setServices(data);
            } catch (err) {
                console.error("Greška pri učitavanju usluga:", err);
            }
        };
        fetchServices();
    }, []);

    // Popuni formu podacima ulogovanog korisnika
    useEffect(() => {
        if (isAuthenticated && user) {
            // Simuliramo handleChange za svako polje
            const fields = [
                { name: "name", value: user.name || "" },
                { name: "phone", value: user.phone || "" },
                { name: "email", value: user.email || "" },
            ];
            fields.forEach((field) => {
                handleChange({ target: field });
            });
        }
    }, [isAuthenticated, user]);

    // Generisi radne sate na osnovu config-a
    const generateTimeSlots = () => {
        const slots = [];
        const [startH, startM] = workingHours.start.split(":").map(Number);
        const [endH, endM] = workingHours.end.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        for (let m = startMinutes; m < endMinutes; m += workingHours.interval) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            slots.push(
                `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
            );
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Validaciona pravila
    const validationRules = {
        name: [
            { required: true, message: "Ime i prezime je obavezno" },
            {
                minLength: 3,
                message: "Ime mora imati najmanje 3 karaktera",
            },
        ],
        phone: [
            { required: true, message: "Broj telefona je obavezan" },
            {
                pattern: /^[\d\s/+\-()]{6,}$/,
                message: "Unesite ispravan broj telefona",
            },
        ],
        date: [{ required: true, message: "Datum je obavezan" }],
        time: [{ required: true, message: "Vreme je obavezno" }],
        service: [{ required: true, message: "Usluga je obavezna" }],
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
    } = useForm(
        {
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            service: "",
        },
        validationRules,
    );

    // Dohvati zauzete termine kada se izabere datum
    useEffect(() => {
        if (values.date) {
            fetch(`/api/appointments/date/${values.date}`)
                .then((res) => res.json())
                .then((data) => {
                    // Izracunaj sve slotove koji su blokirani (ukljucujuci i trajanje usluge)
                    const blockedSlots = new Set();
                    data.forEach((a) => {
                        const startTime = a.time.slice(0, 5);
                        // Koristi trajanje iz baze (vraceno kroz JOIN sa services tabelom)
                        const duration = a.duration || workingHours.interval;
                        // Dodaj sve slotove koje ova usluga blokira
                        const startMinutes = timeToMinutes(startTime);
                        const endMinutes = startMinutes + duration;
                        for (
                            let m = startMinutes;
                            m < endMinutes;
                            m += workingHours.interval
                        ) {
                            blockedSlots.add(minutesToTime(m));
                        }
                    });
                    setBookedTimes([...blockedSlots]);
                })
                .catch(() => setBookedTimes([]));
        }
    }, [values.date]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) return;

        setLoading(true);

        try {
            const result = await create(values);

            if (result.success) {
                showNotification("🎉 Termin uspešno zakazan!", "success");
                setShowProfilePrompt(true);
                reset();
                setBookedTimes([]);
            } else {
                showNotification(result.message, "error");
            }
        } catch {
            showNotification("Greška pri povezivanju sa serverom", "error");
        } finally {
            setLoading(false);
        }
    };

    // Datum limiti
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + booking.maxDaysAhead);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Zakažite termin
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ime i prezime */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ime i prezime *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            touched.name && errors.name
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="Unesite ime i prezime"
                    />
                    {touched.name && errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Telefon */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Broj telefona *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            touched.phone && errors.phone
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                        placeholder="061/234-567"
                    />
                    {touched.phone && errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.phone}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (opciono)
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        placeholder="email@primer.com"
                    />
                </div>

                {/* Datum */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum *
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={values.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={minDate}
                        max={maxDateStr}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            touched.date && errors.date
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                    />
                    {touched.date && errors.date && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.date}
                        </p>
                    )}
                </div>

                {/* Vreme */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vreme *
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((time) => {
                            const isBooked = bookedTimes.includes(time);
                            return (
                                <button
                                    key={time}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() =>
                                        handleChange({
                                            target: {
                                                name: "time",
                                                value: time,
                                            },
                                        })
                                    }
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                                        values.time === time
                                            ? "bg-amber-600 text-white"
                                            : isBooked
                                              ? "bg-red-100 text-red-400 cursor-not-allowed line-through"
                                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {time}
                                    {isBooked && " ❌"}
                                </button>
                            );
                        })}
                    </div>
                    {touched.time && errors.time && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.time}
                        </p>
                    )}
                </div>

                {/* Usluga */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usluga *
                    </label>
                    <select
                        name="service"
                        value={values.service}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            touched.service && errors.service
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        }`}
                    >
                        <option value="">Izaberite uslugu</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.name}>
                                {service.icon} {service.name} - {service.price}€
                                (~{service.duration}min)
                            </option>
                        ))}
                    </select>
                    {touched.service && errors.service && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.service}
                        </p>
                    )}
                </div>

                {/* Submit dugme */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Zakazivanje..." : "Zakaži termin"}
                </button>
            </form>

            {/* Prompt za pregled profila posle zakazivanja */}
            {showProfilePrompt && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-green-800 font-medium mb-3">
                        ✅ Termin uspešno zakazan!
                    </p>
                    <p className="text-green-700 text-sm mb-4">
                        Možete pregledati i upravljati svim svojim terminima u
                        profilu.
                    </p>
                    <button
                        onClick={() => {
                            setShowProfilePrompt(false);
                            onNavigate("/moj-profil");
                        }}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                    >
                        👤 Pogledaj moj profil
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingForm;
