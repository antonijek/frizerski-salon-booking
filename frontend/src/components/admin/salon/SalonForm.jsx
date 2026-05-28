const SalonForm = ({
    showCreateForm,
    newSalon,
    creating,
    setNewSalon,
    handleCreate,
}) => {
    if (!showCreateForm) return null;

    return (
        <form
            onSubmit={handleCreate}
            className="mb-6 p-4 bg-neutral rounded-lg border border-primary-light"
        >
            <h3 className="font-medium text-primary-dark mb-3">
                Novi salon (automatsko kloniranje template-a)
            </h3>
            <p className="text-xs text-primary-light mb-3">
                Prilikom kreiranja, sistem će automatski kopirati usluge,
                frizere i galeriju sa glavnog salona.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                    <label className="block text-sm text-primary-light mb-1">
                        Subdomain *
                    </label>
                    <input
                        type="text"
                        value={newSalon.subdomain}
                        onChange={(e) =>
                            setNewSalon({
                                ...newSalon,
                                subdomain: e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-]/g, ""),
                            })
                        }
                        placeholder="npr. salon1"
                        className="w-full px-3 py-2 border border-primary-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                    <p className="text-xs text-primary-light mt-1">
                        Samo mala slova, brojevi i crtice
                    </p>
                </div>
                <div>
                    <label className="block text-sm text-primary-light mb-1">
                        Ime salona *
                    </label>
                    <input
                        type="text"
                        value={newSalon.name}
                        onChange={(e) =>
                            setNewSalon({
                                ...newSalon,
                                name: e.target.value,
                            })
                        }
                        placeholder="npr. Frizerski Salon Lux"
                        className="w-full px-3 py-2 border border-primary-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-primary-light mb-1">
                        Kratko ime
                    </label>
                    <input
                        type="text"
                        value={newSalon.short_name}
                        onChange={(e) =>
                            setNewSalon({
                                ...newSalon,
                                short_name: e.target.value,
                            })
                        }
                        placeholder="npr. Lux"
                        className="w-full px-3 py-2 border border-primary-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-medium disabled:opacity-50"
            >
                {creating ? "Kreiranje sa template-om..." : "Kreiraj salon"}
            </button>
        </form>
    );
};

export default SalonForm;
