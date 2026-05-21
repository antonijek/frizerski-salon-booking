import { useState } from "react";
import useAppointments from "../hooks/useAppointments";
import { useAppContext } from "../context/AppContext";

// ============================================
// AppointmentList - Moji termini (pretraga po broju telefona)
// ============================================

const AppointmentList = () => {
    const { showNotification } = useAppContext();
    const { appointments, loading, error, fetchByPhone, remove } =
        useAppointments();
    const [phone, setPhone] = useState("");
    const [searched, setSearched] = useState(false);

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

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("sr-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Moji termini
            </h2>
            <p className="text-gray-500 mb-6">
                Unesite broj telefona koji ste koristili prilikom zakazivanja
            </p>

            {/* Pretraga po broju telefona */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="npr. 0612345678"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
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
                    {appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">📅</span>
                                        <span className="font-semibold text-gray-800">
                                            {formatDate(appointment.date)}
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
                                            <span className="text-2xl">📧</span>
                                            <span className="text-gray-700">
                                                {appointment.email}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(appointment.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                >
                                    Obriši
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
