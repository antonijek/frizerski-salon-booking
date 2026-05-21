import salonConfig from "../config/salonConfig";
import SectionWrapper from "./common/SectionWrapper";

// ============================================
// HomePage - Pocetna stranica
// ============================================

const HomePage = ({ onNavigate }) => {
    const { name, tagline, description, services, contact } = salonConfig;

    return (
        <>
            {/* Hero sekcija */}
            <SectionWrapper
                background="bg-gradient-to-br from-amber-500 to-orange-600"
                padding="py-20"
            >
                <div className="text-center text-white">
                    <div className="text-6xl mb-6">✂️</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {name}
                    </h1>
                    <p className="text-xl md:text-2xl text-amber-100 mb-6">
                        {tagline}
                    </p>
                    <p className="text-lg text-amber-50 max-w-2xl mx-auto mb-8">
                        {description}
                    </p>
                    <button
                        onClick={() => onNavigate("/zakazi")}
                        className="bg-white text-amber-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-amber-50 transition shadow-lg"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="text-4xl mb-4">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {service.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {service.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-amber-600">
                                        {service.price}€
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ~{service.duration} min
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            </div>

            {/* Kontakt sekcija */}
            <div id="kontakt">
                <SectionWrapper
                    title="Kontaktirajte nas"
                    subtitle="Tu smo za sva vaša pitanja"
                    background="bg-gray-50"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="text-4xl mb-3">📞</div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Telefon
                            </h3>
                            <p className="text-gray-600">{contact.phone}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="text-4xl mb-3">📧</div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Email
                            </h3>
                            <p className="text-gray-600">{contact.email}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
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
