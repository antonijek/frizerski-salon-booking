// ============================================
// ServiceCard - Kartica za prikaz usluge
// ============================================

const ServiceCard = ({ service }) => {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 hover:shadow-lg hover:border-amber-400 transition-all">
            <div className="text-4xl mb-4 text-center">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {service.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">
                    {service.price}€
                </span>
                <span className="text-sm text-gray-500">
                    ~{service.duration} min
                </span>
            </div>
        </div>
    );
};

export default ServiceCard;
