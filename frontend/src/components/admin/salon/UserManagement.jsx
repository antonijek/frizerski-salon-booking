import LoadingSpinner from "../../common/LoadingSpinner";

const UserManagement = ({
    showUsers,
    users,
    usersLoading,
    superAdminEmail,
    promoting,
    setSuperAdminEmail,
    handleMakeSuperAdmin,
}) => {
    if (!showUsers) return null;

    return (
        <div className="mb-6 p-4 bg-neutral rounded-lg border border-primary-light">
            <h3 className="font-medium text-primary-dark mb-3">
                👥 Upravljanje super adminima
            </h3>

            {/* Forma za postavljanje super admina */}
            <form onSubmit={handleMakeSuperAdmin} className="flex gap-3 mb-4">
                <input
                    type="email"
                    value={superAdminEmail}
                    onChange={(e) => setSuperAdminEmail(e.target.value)}
                    placeholder="Unesite email korisnika"
                    className="flex-1 px-3 py-2 border border-primary-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                <button
                    type="submit"
                    disabled={promoting}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50"
                >
                    {promoting ? "Postavljanje..." : "Postavi kao super admin"}
                </button>
            </form>

            {/* Lista korisnika */}
            {usersLoading ? (
                <LoadingSpinner />
            ) : users.length === 0 ? (
                <p className="text-sm text-primary-light">Nema korisnika.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary-light">
                                <th className="text-left py-2 px-2 text-primary-light font-medium">
                                    Ime
                                </th>
                                <th className="text-left py-2 px-2 text-primary-light font-medium">
                                    Email
                                </th>
                                <th className="text-left py-2 px-2 text-primary-light font-medium">
                                    Salon
                                </th>
                                <th className="text-left py-2 px-2 text-primary-light font-medium">
                                    Uloga
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b border-primary-light/50"
                                >
                                    <td className="py-2 px-2 text-primary-dark">
                                        {u.name}
                                    </td>
                                    <td className="py-2 px-2 text-primary-dark">
                                        {u.email}
                                    </td>
                                    <td className="py-2 px-2 text-primary-light">
                                        {u.salon_name || "-"}
                                    </td>
                                    <td className="py-2 px-2">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                u.is_super_admin
                                                    ? "bg-purple-100 text-purple-700"
                                                    : u.is_admin
                                                      ? "bg-blue-100 text-blue-700"
                                                      : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {u.is_super_admin
                                                ? "Super Admin"
                                                : u.is_admin
                                                  ? "Admin"
                                                  : "Korisnik"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
