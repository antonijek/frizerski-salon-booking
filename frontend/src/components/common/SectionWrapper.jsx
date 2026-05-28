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
    customStyle,
}) => {
    return (
        <section
            className={`${padding} ${background} ${className}`}
            style={customStyle}
        >
            <div className="max-w-4xl mx-auto px-4">
                {(title || subtitle) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-primary-light max-w-2xl mx-auto leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                        <div className="mt-4 w-20 h-1 bg-gradient-primary mx-auto rounded-full" />
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
