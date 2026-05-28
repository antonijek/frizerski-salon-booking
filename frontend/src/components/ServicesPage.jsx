import { useState, useEffect } from "react";
import SectionWrapper from "./common/SectionWrapper";
import ServiceCard from "./common/ServiceCard";
import LoadingSpinner from "./common/LoadingSpinner";
import serviceService from "../services/serviceService";

// ============================================
// ServicesPage - Stranica sa uslugama
// ============================================

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await serviceService.getAll();
                setServices(data);
            } catch (err) {
                setError(err.error || "Greška pri učitavanju usluga");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) return <LoadingSpinner message="Učitavanje usluga..." />;

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <SectionWrapper
                title="Naše usluge"
                subtitle="Profesionalne usluge po pristupačnim cenama"
            >
                {services.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">✂️</div>
                        <p className="text-primary-light">
                            Trenutno nema dostupnih usluga
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </SectionWrapper>
        </div>
    );
};

export default ServicesPage;
