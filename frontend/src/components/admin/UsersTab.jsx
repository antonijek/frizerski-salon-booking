import useAdminUsers from "../../hooks/useAdminUsers";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "./EmptyState";
import NotificationBanner from "./NotificationBanner";
import AdminModal from "./AdminModal";
import ConfirmDialog from "../common/ConfirmDialog";

const UsersTab = () => {
    const {
        users,
        loading,
        error,
        successMessage,
        editingUser,
        editForm,
        saving,
        confirmDelete,
        openEditForm,
        closeEditForm,
        handleEditChange,
        handleEditSubmit,
        handleDelete,
        setConfirmDelete,
        fetchUsers,
        clearError,
    } = useAdminUsers();

    if (loading) return <LoadingSpinner message="Učitavanje korisnika..." />;

    return (
        <div>
            <NotificationBanner
                type="error"
                message={error}
                onClose={clearError}
            />
            <NotificationBanner type="success" message={successMessage} />

            <div className="flex justify-between items-center mb-6">
                <p className="text-primary-light text-sm">
                    {users.length} registrovanih korisnika
                </p>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-neutral text-primary-dark rounded-lg hover:bg-primary-light transition text-sm"
                >
                    🔄 Osveži
                </button>
            </div>

            {users.length === 0 ? (
                <EmptyState icon="👥" message="Nema registrovanih korisnika" />
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral border-b">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Ime
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Telefon
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Uloga
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Datum registracije
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-primary-dark">
                                        Akcija
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-primary-light transition"
                                    >
                                        <td className="px-4 py-3 text-sm text-primary-dark">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {user.phone || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {user.is_admin ? (
                                                <span className="bg-primary-light text-primary-hover px-2 py-0.5 rounded-full text-xs font-medium">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="bg-neutral text-primary-light px-2 py-0.5 rounded-full text-xs">
                                                    Korisnik
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-primary-light">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString("sr-RS", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() =>
                                                        openEditForm(user)
                                                    }
                                                    className="text-primary hover:text-primary-hover transition text-sm"
                                                    title="Izmeni korisnika"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setConfirmDelete(user)
                                                    }
                                                    className="text-red-500 hover:text-red-700 transition text-sm"
                                                    title="Obriši korisnika"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal za izmenu korisnika */}
            <AdminModal
                isOpen={!!editingUser}
                onClose={closeEditForm}
                title="Izmeni korisnika"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Ime *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            Telefon
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_admin"
                            id="is_admin"
                            checked={editForm.is_admin}
                            onChange={handleEditChange}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                            htmlFor="is_admin"
                            className="text-sm font-medium text-primary-dark"
                        >
                            Admin korisnik
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeEditForm}
                            className="flex-1 py-2 border border-gray-300 text-primary-dark rounded-lg hover:bg-primary-light transition font-medium"
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Confirm dialog za brisanje */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Obriši korisnika"
                message={`Da li ste sigurni da želite da obrišete korisnika "${confirmDelete?.name}"?`}
                onConfirm={() => {
                    handleDelete(confirmDelete);
                    setConfirmDelete(null);
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default UsersTab;
