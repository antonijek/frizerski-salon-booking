// ============================================
// ServiceCard - Kartica za prikaz usluge
// ============================================

const ServiceCard = ({ service }) => {
    return (
        <div className="bg-primary-light border border-primary-light rounded-xl p-6 hover:shadow-lg hover:border-primary transition-all">
            <div className="text-4xl mb-4 text-center">{service.icon}</div>
            <h3 className="text-xl font-semibold text-primary-dark mb-2">
                {service.name}
            </h3>
            <p className="text-primary-light text-sm mb-4">
                {service.description}
            </p>
            <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                    {service.price}€
                </span>
                <span className="text-sm text-primary-light">
                    ~{service.duration} min
                </span>
            </div>
        </div>
    );
};

export default ServiceCard;
