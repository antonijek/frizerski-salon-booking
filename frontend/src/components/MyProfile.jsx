import { useState, useEffect } from "react";
import useAppointments from "../hooks/useAppointments";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import salonConfig from "../config/salonConfig";

// ============================================
// MyProfile - Moj profil sa terminima
// ============================================

const MyProfile = () => {
    const { showNotification } = useAppContext();
    const { user, isAuthenticated } = useAuth();
    const { appointments, loading, error, fetchByPhone, update, remove } =
        useAppointments();
    const [phone, setPhone] = useState("");
    const [searched, setSearched] = useState(false);

    // Automatski ucitaj termine ako je korisnik ulogovan
    useEffect(() => {
        if (isAuthenticated && user?.phone) {
            setPhone(user.phone);
            setSearched(true);
            fetchByPhone(user.phone);
        }
    }, [isAuthenticated, user?.phone]);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        service: "",
    });
    const [bookedTimes, setBookedTimes] = useState([]);
    const [saving, setSaving] = useState(false);

    const { services, workingHours } = salonConfig;

    // Generisi radne sate
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

    // Dohvati zauzete termine za izabrani datum (osim trenutnog)
    useEffect(() => {
        if (editForm.date && editingAppointment) {
            fetch(`/api/appointments/date/${editForm.date}`)
                .then((res) => res.json())
                .then((data) => {
                    const filtered = data
                        .filter((a) => a.id !== editingAppointment.id)
                        .map((a) => a.time.slice(0, 5));
                    setBookedTimes(filtered);
                })
                .catch(() => setBookedTimes([]));
        }
    }, [editForm.date, editingAppointment]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!phone.trim()) {
            showNotification("Unesite broj telefona", "error");
            return;
        }
        setSearched(true);
        fetchByPhone(phone.trim());
    };

    const handleDelete = async (id) => {
        if (!confirm("Da li ste sigurni da želite da obrišete ovaj termin?"))
            return;

        const success = await remove(id);
        if (success) {
            showNotification("Termin uspešno obrisan", "success");
        } else {
            showNotification("Greška pri brisanju termina", "error");
        }
    };

    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setEditForm({
            name: appointment.name,
            phone: appointment.phone,
            email: appointment.email || "",
            date: appointment.date,
            time: appointment.time.slice(0, 5),
            service: appointment.service,
        });
        setBookedTimes([]);
    };

    const closeEditModal = () => {
        setEditingAppointment(null);
        setEditForm({
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            service: "",
        });
        setBookedTimes([]);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (
            !editForm.name.trim() ||
            !editForm.phone.trim() ||
            !editForm.date ||
            !editForm.time ||
            !editForm.service
        ) {
            showNotification("Sva polja su obavezna", "error");
            return;
        }

        setSaving(true);
        const result = await update(editingAppointment.id, editForm);
        setSaving(false);

        if (result.success) {
            showNotification("✅ Termin uspešno izmenjen!", "success");
            closeEditModal();
        } else {
            showNotification(result.message, "error");
        }
    };

    const formatDate = (dateStr) => {
        try {
            // Proveri da li je datum validan
            if (!dateStr) return "Nepoznat datum";

            // Parsiraj YYYY-MM-DD format
            const parts = dateStr.split("-");
            if (parts.length !== 3) return dateStr;

            const date = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2]),
            );

            // Proveri da li je datum validan
            if (isNaN(date.getTime())) return dateStr;

            return date.toLocaleDateString("sr-RS", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const isPastAppointment = (dateStr, timeStr) => {
        const appointmentDate = new Date(`${dateStr}T${timeStr}`);
        return appointmentDate < new Date();
    };

    // Datum limiti za izmenu
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + salonConfig.booking.maxDaysAhead);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                👤 Moj profil
            </h2>
            <p className="text-gray-500 mb-6">
                Unesite broj telefona da vidite i upravljate svojim terminima
            </p>

            {/* Pretraga po broju telefona */}
            <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 mb-6"
            >
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="npr. 0612345678"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                >
                    🔍 Pretraži
                </button>
            </form>

            {loading && (
                <div className="text-center py-8 text-gray-500">
                    Učitavanje termina...
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {!loading && !error && searched && appointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-lg">
                        Nema zakazanih termina za ovaj broj telefona
                    </p>
                </div>
            )}

            {!loading && appointments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">
                        Vaši termini ({appointments.length})
                    </h3>
                    {appointments.map((appointment) => {
                        const isPast = isPastAppointment(
                            appointment.date,
                            appointment.time,
                        );
                        return (
                            <div
                                key={appointment.id}
                                className={`border rounded-xl p-4 hover:shadow-md transition ${
                                    isPast
                                        ? "border-gray-200 bg-gray-50 opacity-75"
                                        : "border-gray-200"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📅</span>
                                            <span
                                                className={`font-semibold ${
                                                    isPast
                                                        ? "text-gray-500"
                                                        : "text-gray-800"
                                                }`}
                                            >
                                                {formatDate(appointment.date)}
                                                {isPast && (
                                                    <span className="ml-2 text-sm text-gray-400">
                                                        (prošli termin)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">⏰</span>
                                            <span className="text-gray-700">
                                                {appointment.time.slice(0, 5)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">✂️</span>
                                            <span className="text-gray-700">
                                                {appointment.service}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">👤</span>
                                            <span className="text-gray-700">
                                                {appointment.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📞</span>
                                            <span className="text-gray-700">
                                                {appointment.phone}
                                            </span>
                                        </div>
                                        {appointment.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">
                                                    📧
                                                </span>
                                                <span className="text-gray-700">
                                                    {appointment.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {!isPast && (
                                        <div className="flex gap-2 sm:self-start">
                                            <button
                                                onClick={() =>
                                                    openEditModal(appointment)
                                                }
                                                className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                                            >
                                                Izmeni
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(appointment.id)
                                                }
                                                className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                            >
                                                Otkaži
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal za izmenu termina */}
            {editingAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Izmeni termin
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Ime */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ime i prezime *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Broj telefona *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (opciono)
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
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
                                    value={editForm.date}
                                    onChange={handleEditChange}
                                    min={minDate}
                                    max={maxDateStr}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Vreme */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vreme *
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {timeSlots.map((time) => {
                                        const isBooked =
                                            bookedTimes.includes(time);
                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                disabled={isBooked}
                                                onClick={() =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        time,
                                                    }))
                                                }
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                                                    editForm.time === time
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
                            </div>

                            {/* Usluga */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usluga *
                                </label>
                                <select
                                    name="service"
                                    value={editForm.service}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Izaberite uslugu</option>
                                    {services.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.name}
                                        >
                                            {service.icon} {service.name} -{" "}
                                            {service.price}€ (~
                                            {service.duration}
                                            min)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dugmad */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Odustani
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
