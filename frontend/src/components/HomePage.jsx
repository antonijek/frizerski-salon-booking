import { useState, useEffect } from "react";
import salonConfig from "../config/salonConfig";
import SectionWrapper from "./common/SectionWrapper";
import ServiceCard from "./common/ServiceCard";
import Gallery from "./common/Gallery";
import Team from "./common/Team";
import Testimonials from "./common/Testimonials";
import serviceService from "../services/serviceService";

// ============================================
// HomePage - Pocetna stranica
// ============================================

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100"
            >
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4 animate-shimmer" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-shimmer" />
                <div className="pt-4 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-shimmer" />
                </div>
            </div>
        ))}
    </div>
);

const HomePage = ({ onNavigate }) => {
    const { name, tagline, description, contact } = salonConfig;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await serviceService.getAll();
                setServices(data);
            } catch (err) {
                console.error("Greška pri učitavanju usluga:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <>
            {/* Hero sekcija */}
            <SectionWrapper
                background="bg-gradient-to-br from-amber-500 to-orange-600"
                padding="pt-28 pb-20"
            >
                <div className="text-center text-white relative">
                    {/* Dekorativni elementi */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
                    <div
                        className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 animate-float"
                        style={{ animationDelay: "1.5s" }}
                    />

                    <div className="text-6xl mb-6 animate-float">✂️</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
                        {name}
                    </h1>
                    <p
                        className="text-xl md:text-2xl text-amber-100 mb-6 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        {tagline}
                    </p>
                    <p
                        className="text-lg text-amber-50 max-w-2xl mx-auto mb-8 animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        {description}
                    </p>
                    <button
                        onClick={() => onNavigate("/zakazi")}
                        className="bg-white text-amber-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                    >
                        Zakažite termin
                    </button>
                </div>
            </SectionWrapper>

            {/* Usluge sekcija */}
            <div id="usluge">
                <SectionWrapper
                    title="Naše usluge"
                    subtitle="Profesionalne usluge po pristupačnim cenama"
                >
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                />
                            ))}
                        </div>
                    )}
                </SectionWrapper>
            </div>

            {/* Galerija */}
            <div id="galerija">
                <Gallery />
            </div>

            {/* Tim */}
            <div id="tim">
                <Team />
            </div>

            {/* Testimonijali */}
            <div id="utisci">
                <Testimonials />
            </div>

            {/* Kontakt sekcija */}
            <div id="kontakt">
                <SectionWrapper
                    title="Kontaktirajte nas"
                    subtitle="Tu smo za sva vaša pitanja"
                    background="bg-gray-50"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl mb-3">📞</div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Telefon
                            </h3>
                            <p className="text-gray-600">{contact.phone}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl mb-3">📧</div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Email
                            </h3>
                            <p className="text-gray-600">{contact.email}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl mb-3">📍</div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Adresa
                            </h3>
                            <p className="text-gray-600">{contact.address}</p>
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </>
    );
};

export default HomePage;
