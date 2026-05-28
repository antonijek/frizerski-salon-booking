const FontsForm = ({ form, handleChange, fontOptions }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                🔤 Fontovi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Font za naslove
                    </label>
                    <select
                        name="heading_font"
                        value={form.heading_font}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    >
                        {fontOptions.map((font) => (
                            <option key={font} value={font}>
                                {font}
                            </option>
                        ))}
                    </select>
                    <p
                        className="mt-2 text-lg text-primary-light"
                        style={{
                            fontFamily: `"${form.heading_font}", sans-serif`,
                        }}
                    >
                        Preview: Naslov
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                        Font za tekst
                    </label>
                    <select
                        name="body_font"
                        value={form.body_font}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    >
                        {fontOptions.map((font) => (
                            <option key={font} value={font}>
                                {font}
                            </option>
                        ))}
                    </select>
                    <p
                        className="mt-2 text-sm text-primary-light"
                        style={{
                            fontFamily: `"${form.body_font}", sans-serif`,
                        }}
                    >
                        Preview: Ovo je primer teksta. Lorem ipsum dolor sit
                        amet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FontsForm;
