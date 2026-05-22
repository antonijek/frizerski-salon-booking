import salonConfig from "../config/salonConfig";
import SectionWrapper from "./common/SectionWrapper";
import ServiceCard from "./common/ServiceCard";

// ============================================
// ServicesPage - Stranica sa uslugama
// ============================================

const ServicesPage = () => {
    const { services } = salonConfig;

    return (
        <div>
            <SectionWrapper
                title="Naše usluge"
                subtitle="Profesionalne usluge po pristupačnim cenama"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </SectionWrapper>
        </div>
    );
};

export default ServicesPage;
