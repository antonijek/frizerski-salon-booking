// ============================================
// FormField - Reusable input polje sa labelom i error porukom
// ============================================

const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    touched,
    placeholder,
    required = false,
    children,
    min,
    max,
    className = "",
}) => {
    const baseClass =
        "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none";
    const errorClass =
        touched && error ? "border-red-300 bg-red-50" : "border-gray-300";

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-primary-dark mb-1">
                {label}
                {required && " *"}
            </label>
            {children ? (
                children
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    className={`${baseClass} ${errorClass}`}
                />
            )}
            {touched && error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default FormField;
