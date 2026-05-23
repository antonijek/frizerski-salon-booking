import { useState, useEffect } from "react";
import salonConfig from "../config/salonConfig";
import useForm from "../hooks/useForm";
import useAppointments from "../hooks/useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import serviceService from "../services/serviceService";
import appointmentService from "../services/appointmentService";
import barberService from "../services/barberService";

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
    const [barbers, setBarbers] = useState([]);

    const { workingHours, booking } = salonConfig;

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

    // Ucitaj usluge i frizere iz baze
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesData, barbersData] = await Promise.all([
                    serviceService.getAll(),
                    barberService.getAll(),
                ]);
                setServices(servicesData);
                setBarbers(barbersData);
            } catch (err) {
                console.error("Greška pri učitavanju podataka:", err);
            }
        };
        fetchData();
    }, []);

    // Popuni formu podacima ulogovanog korisnika
    useEffect(() => {
        if (isAuthenticated && user) {
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

    // Pronadji izabranog frizera
    const selectedBarber = values.barber_id
        ? barbers.find((b) => b.id === parseInt(values.barber_id))
        : null;

    // Generisi radne sate - uzima najraniji pocetak i najkasniji kraj od svih frizera
    // Ako nema frizera, koristi default iz config-a
    const generateTimeSlots = () => {
        // Pronadji najraniji pocetak i najkasniji kraj medju frizerima
        let earliestStart = workingHours.start;
        let latestEnd = workingHours.end;
        if (barbers.length > 0) {
            barbers.forEach((b) => {
                if (b.work_start && b.work_start < earliestStart)
                    earliestStart = b.work_start;
                if (b.work_end && b.work_end > latestEnd)
                    latestEnd = b.work_end;
            });
        }

        const slots = [];
        const [startH, startM] = earliestStart.split(":").map(Number);
        const [endH, endM] = latestEnd.split(":").map(Number);
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

    // Filtriraj slotove po radnom vremenu izabranog frizera (ako je izabran)
    const filterSlotsByBarber = (slots) => {
        if (!selectedBarber) return slots; // nije izabran frizer - prikazi sve
        const start = selectedBarber.work_start || workingHours.start;
        const end = selectedBarber.work_end || workingHours.end;
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const barberStart = startH * 60 + startM;
        const barberEnd = endH * 60 + endM;

        return slots.filter((slot) => {
            const [h, m] = slot.split(":").map(Number);
            const slotMinutes = h * 60 + m;
            return slotMinutes >= barberStart && slotMinutes < barberEnd;
        });
    };

    const allTimeSlots = generateTimeSlots();
    const timeSlots = filterSlotsByBarber(allTimeSlots);

    // Proveri da li je izabrani datum radni dan za izabranog frizera
    const isDateAvailable = (dateStr) => {
        if (!dateStr) return true;
        if (!selectedBarber) return true; // nije izabran frizer - uvek dostupno
        const date = new Date(dateStr + "T00:00:00");
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        // Konvertujemo u format koji koristimo u bazi: 1=Pon, 2=Uto, ..., 7=Ned
        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        if (selectedBarber?.work_days) {
            const workDays = selectedBarber.work_days
                .split(",")
                .map((d) => d.trim());
            return workDays.includes(dbDay.toString());
        }
        return true;
    };

    // Dohvati zauzete termine kada se izabere datum i/ili frizer
    useEffect(() => {
        if (values.date) {
            const fetchBookedTimes = async () => {
                try {
                    let data;
                    if (values.barber_id) {
                        // Ako je izabran frizer, dohvati samo njegove termine
                        data = await appointmentService.getByDateAndBarber(
                            values.date,
                            values.barber_id,
                        );
                    } else {
                        // Ako nije izabran frizer, dohvati sve termine
                        data = await appointmentService.getByDate(values.date);
                    }

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
                } catch {
                    setBookedTimes([]);
                }
            };
            fetchBookedTimes();
        }
    }, [values.date, values.barber_id]);

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

                {/* Izbor frizera (opciono) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Željeni frizer (opciono)
                    </label>
                    <select
                        name="barber_id"
                        value={values.barber_id || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    >
                        <option value="">Bilo koji frizer</option>
                        {barbers.map((barber) => (
                            <option key={barber.id} value={barber.id}>
                                ✂️ {barber.name}
                                {barber.work_start &&
                                    barber.work_end &&
                                    ` (${barber.work_start}-${barber.work_end})`}
                            </option>
                        ))}
                    </select>
                    {selectedBarber && (
                        <p className="mt-1 text-xs text-gray-500">
                            Radno vreme: {selectedBarber.work_start || "?"} -{" "}
                            {selectedBarber.work_end || "?"}
                        </p>
                    )}
                </div>

                {/* Upozorenje ako datum nije radni dan za izabranog frizera */}
                {values.date &&
                    selectedBarber &&
                    !isDateAvailable(values.date) && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                            ⚠️ Izabrani frizer ne radi na ovaj dan. Izaberite
                            drugi datum ili drugog frizera.
                        </div>
                    )}

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
