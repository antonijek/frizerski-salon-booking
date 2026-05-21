// ============================================
// SectionWrapper - wrapper za sekcije sa stilom
// ============================================

const SectionWrapper = ({
    children,
    title,
    subtitle,
    className = "",
    background = "bg-white",
    padding = "py-12",
}) => {
    return (
        <section className={`${padding} ${background} ${className}`}>
            <div className="max-w-4xl mx-auto px-4">
                {(title || subtitle) && (
                    <div className="text-center mb-10">
                        {title && (
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                        <div className="mt-4 w-20 h-1 bg-amber-500 mx-auto rounded-full" />
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
