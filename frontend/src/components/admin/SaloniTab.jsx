import { useState, useEffect } from "react";
import salonService from "../../services/salonService";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import SalonForm from "./salon/SalonForm";
import UserManagement from "./salon/UserManagement";

// ============================================
// SaloniTab - Upravljanje salonima (samo super admin)
// ============================================

const SaloniTab = () => {
    const { isSuperAdmin, isSwitchedContext, switchToSalon } = useAuth();
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSalon, setNewSalon] = useState({
        subdomain: "",
        name: "",
        short_name: "",
    });
    const [creating, setCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Super Admin Management
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const [superAdminEmail, setSuperAdminEmail] = useState("");
    const [promoting, setPromoting] = useState(false);

    const fetchSalons = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await salonService.getAll();
            setSalons(data);
        } catch (err) {
            setError(err.error || "Greška pri dohvatanju salona");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const data = await salonService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.error || "Greška pri dohvatanju korisnika");
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchSalons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newSalon.subdomain || !newSalon.name) return;

        try {
            setCreating(true);
            setError(null);
            await salonService.create(newSalon);
            setSuccessMessage(
                `Salon "${newSalon.name}" uspešno kreiran sa template podacima!`,
            );
            setShowCreateForm(false);
            setNewSalon({ subdomain: "", name: "", short_name: "" });
            fetchSalons();
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            setError(err.error || "Greška pri kreiranju salona");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeleting(true);
            setError(null);
            await salonService.delete(id);
            setSuccessMessage("Salon i svi njegovi podaci uspešno obrisani!");
            setDeleteConfirm(null);
            fetchSalons();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.error || "Greška pri brisanju salona");
        } finally {
            setDeleting(false);
        }
    };

    const handleMakeSuperAdmin = async (e) => {
        e.preventDefault();
        if (!superAdminEmail) return;

        try {
            setPromoting(true);
            setError(null);
            await salonService.makeSuperAdmin(superAdminEmail);
            setSuccessMessage(
                `Korisnik "${superAdminEmail}" je postavljen za super admina!`,
            );
            setSuperAdminEmail("");
            fetchUsers();
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            setError(err.error || "Greška pri postavljanju super admina");
        } finally {
            setPromoting(false);
        }
    };

    // Ako korisnik nije super admin, prikaži poruku
    if (!isSuperAdmin) {
        return (
            <div className="p-6 text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-semibold text-primary-dark mb-2">
                    Samo za super admina
                </h2>
                <p className="text-primary-light">
                    Ova sekcija je dostupna samo super administratoru sistema.
                </p>
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary-dark">
                    🏢 Upravljanje salonima
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setShowUsers(!showUsers);
                            if (!showUsers) fetchUsers();
                            setError(null);
                        }}
                        className="px-4 py-2 bg-neutral text-primary-dark border border-primary-light rounded-lg hover:bg-primary-light/50 transition text-sm font-medium"
                    >
                        {showUsers ? "✕ Sakrij korisnike" : "👥 Korisnici"}
                    </button>
                    <button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setError(null);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium"
                    >
                        {showCreateForm ? "✕ Otkaži" : "➕ Novi salon"}
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* User Management */}
            <UserManagement
                showUsers={showUsers}
                users={users}
                usersLoading={usersLoading}
                superAdminEmail={superAdminEmail}
                promoting={promoting}
                setSuperAdminEmail={setSuperAdminEmail}
                handleMakeSuperAdmin={handleMakeSuperAdmin}
            />

            {/* Create Salon Form */}
            <SalonForm
                showCreateForm={showCreateForm}
                newSalon={newSalon}
                creating={creating}
                setNewSalon={setNewSalon}
                handleCreate={handleCreate}
            />

            {/* Lista salona sa statistikom */}
            {salons.length === 0 ? (
                <EmptyState
                    icon="🏢"
                    title="Nema salona"
                    description="Kreirajte prvi salon."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary-light">
                                <th className="text-left py-3 px-2 text-primary-light font-medium">
                                    ID
                                </th>
                                <th className="text-left py-3 px-2 text-primary-light font-medium">
                                    Ime
                                </th>
                                <th className="text-left py-3 px-2 text-primary-light font-medium">
                                    Subdomain
                                </th>
                                <th className="text-center py-3 px-2 text-primary-light font-medium">
                                    🧑‍💼 Fr.
                                </th>
                                <th className="text-center py-3 px-2 text-primary-light font-medium">
                                    💇 Usl.
                                </th>
                                <th className="text-center py-3 px-2 text-primary-light font-medium">
                                    📅 Term.
                                </th>
                                <th className="text-center py-3 px-2 text-primary-light font-medium">
                                    👥 Kor.
                                </th>
                                <th className="text-center py-3 px-2 text-primary-light font-medium">
                                    Status
                                </th>
                                <th className="text-left py-3 px-2 text-primary-light font-medium">
                                    Kreiran
                                </th>
                                <th className="text-right py-3 px-2 text-primary-light font-medium">
                                    Akcije
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {salons.map((salon) => (
                                <tr
                                    key={salon.id}
                                    className="border-b border-primary-light/50 hover:bg-neutral/50 transition"
                                >
                                    <td className="py-3 px-2 text-primary-dark text-xs">
                                        {salon.id}
                                    </td>
                                    <td className="py-3 px-2 text-primary-dark font-medium">
                                        {salon.name}
                                        {salon.short_name &&
                                            salon.short_name !== salon.name && (
                                                <span className="text-primary-light text-xs ml-1">
                                                    ({salon.short_name})
                                                </span>
                                            )}
                                    </td>
                                    <td className="py-3 px-2">
                                        <code className="bg-neutral px-2 py-1 rounded text-xs text-primary">
                                            {salon.subdomain}
                                        </code>
                                    </td>
                                    <td className="py-3 px-2 text-center text-primary-dark font-medium">
                                        {salon.barber_count || 0}
                                    </td>
                                    <td className="py-3 px-2 text-center text-primary-dark font-medium">
                                        {salon.service_count || 0}
                                    </td>
                                    <td className="py-3 px-2 text-center text-primary-dark font-medium">
                                        {salon.appointment_count || 0}
                                    </td>
                                    <td className="py-3 px-2 text-center text-primary-dark font-medium">
                                        {salon.user_count || 0}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                salon.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {salon.is_active
                                                ? "Aktivan"
                                                : "Neaktivan"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-primary-light text-xs">
                                        {new Date(
                                            salon.created_at,
                                        ).toLocaleDateString("sr-RS")}
                                    </td>
                                    <td className="py-3 px-2 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            {salon.is_active &&
                                                isSuperAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            switchToSalon(
                                                                salon.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isSwitchedContext
                                                        }
                                                        className={`px-3 py-1 text-xs rounded transition ${
                                                            isSwitchedContext
                                                                ? "text-primary-light cursor-not-allowed"
                                                                : "text-primary hover:bg-primary/10"
                                                        }`}
                                                        title={
                                                            isSwitchedContext
                                                                ? "Već ste u režimu jednog salona. Vratite se prvo na Super Admin."
                                                                : `Uđi u salon "${salon.name}" kao admin`
                                                        }
                                                    >
                                                        🚪 Uđi
                                                    </button>
                                                )}
                                            {salon.subdomain !== "main" && (
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirm(salon)
                                                    }
                                                    className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                                                >
                                                    Obriši
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmDialog
                    isOpen={true}
                    title="Obriši salon"
                    message={`Da li ste sigurni da želite da obrišete salon "${deleteConfirm.name}"? Svi podaci (termini, usluge, frizeri, galerija, korisnici) će biti obrisani.`}
                    confirmText={deleting ? "Brisanje..." : "Obriši"}
                    onConfirm={() => handleDelete(deleteConfirm.id)}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={deleting}
                />
            )}
        </div>
    );
};

export default SaloniTab;
