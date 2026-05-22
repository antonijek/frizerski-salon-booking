import salonConfig from "../config/salonConfig";
import SectionWrapper from "./common/SectionWrapper";

// ============================================
// ContactPage - Stranica sa kontakt informacijama
// ============================================

const ContactPage = () => {
    const { contact } = salonConfig;

    return (
        <div>
            <SectionWrapper
                title="Kontaktirajte nas"
                subtitle="Tu smo za sva vaša pitanja"
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
    );
};

export default ContactPage;
