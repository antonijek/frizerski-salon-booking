import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ============================================
// Register - Forma za registraciju korisnika
// ============================================

const Register = ({ onNavigate }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validacija
        if (formData.password !== formData.confirmPassword) {
            setError("Lozinke se ne poklapaju");
            return;
        }

        if (formData.password.length < 6) {
            setError("Lozinka mora imati najmanje 6 karaktera");
            return;
        }

        setLoading(true);

        try {
            await register(
                formData.name,
                formData.email,
                formData.password,
                formData.phone,
            );
            onNavigate("/");
        } catch (err) {
            setError(err.error || "Greška pri registraciji");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Registracija
                    </h2>
                    <p className="text-gray-500 mt-1">Napravite vaš nalog</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ime i prezime *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Vaše ime"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="vase@email.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+381 6X XXX XXXX"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lozinka *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="Najmanje 6 karaktera"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Potvrdi lozinku *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Ponovite lozinku"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                    >
                        {loading ? "Registracija..." : "Registruj se"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Već imate nalog?{" "}
                    <button
                        onClick={() => onNavigate("/login")}
                        className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                        Prijavite se
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
