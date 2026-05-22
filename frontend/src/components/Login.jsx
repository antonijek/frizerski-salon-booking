import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ============================================
// Login - Forma za prijavu korisnika
// ============================================

const Login = ({ onNavigate }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
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
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            onNavigate("/");
        } catch (err) {
            setError(err.error || "Greška pri prijavi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Prijava
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Prijavite se na vaš nalog
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
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
                            Lozinka
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                    >
                        {loading ? "Prijavljivanje..." : "Prijavi se"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Nemate nalog?{" "}
                    <button
                        onClick={() => onNavigate("/register")}
                        className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                        Registrujte se
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
