const BasicInfoForm = ({ form, handleChange }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                📋 Osnovne informacije
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Naziv salona
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Skraćeni naziv
                    </label>
                    <input
                        type="text"
                        name="short_name"
                        value={form.short_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Slogan
                    </label>
                    <input
                        type="text"
                        name="tagline"
                        value={form.tagline}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Opis
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoForm;
