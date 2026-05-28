const COLOR_FIELDS = [
    { label: "Primarna boja", name: "primary_color" },
    { label: "Hover (prelaz)", name: "primary_hover" },
    { label: "Svetla nijansa", name: "primary_light" },
    { label: "Pozadina (od)", name: "primary_bg_from" },
    { label: "Pozadina (do)", name: "primary_bg_to" },
    { label: "Neutralna pozadina", name: "neutral_bg" },
    { label: "Tekst (primarni)", name: "text_primary" },
    { label: "Tekst (sekundarni)", name: "text_secondary" },
];

const ColorsForm = ({ form, handleChange }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-primary-dark mb-4">
                🎨 Boje
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLOR_FIELDS.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-primary-dark mb-1">
                            {field.label}
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                            />
                            <input
                                type="text"
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColorsForm;
