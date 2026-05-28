const ContactInfoForm = ({ form, handleChange }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                📞 Kontakt informacije
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Telefon
                    </label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Adresa
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactInfoForm;
