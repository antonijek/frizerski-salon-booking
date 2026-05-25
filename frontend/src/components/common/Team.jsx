import { useState, useEffect } from "react";
import salonConfig from "../../config/salonConfig";
import SectionWrapper from "./SectionWrapper";
import barberService from "../../services/barberService";

// ============================================
// Team - Sekcija za prikaz tima frizera
// ============================================

const Team = () => {
    const { team } = salonConfig;
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const data = await barberService.getActive();
                setBarbers(data);
            } catch (err) {
                console.error("Greška pri učitavanju frizera:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBarbers();
    }, []);

    // Ako tim nije ukljucen, ne prikazuj nista
    if (!team?.enabled) return null;

    // Dok se učitava ili nema frizera, ne prikazuj nista
    if (loading || !barbers.length) return null;

    return (
        <SectionWrapper
            title={team.title}
            subtitle={team.subtitle}
            background="bg-white"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {barbers.map((barber) => (
                    <div key={barber.id} className="group text-center">
                        {/* Slika */}
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-amber-100 group-hover:ring-amber-300 transition-all duration-300">
                                {barber.image_url ? (
                                    <img
                                        src={barber.image_url}
                                        alt={barber.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">
                                            {barber.name
                                                .split(" ")
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* Decorative dots */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-amber-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                        </div>

                        {/* Info */}
                        <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors">
                            {barber.name}
                        </h3>
                        {barber.title && (
                            <p className="text-amber-600 font-medium text-sm mb-3">
                                {barber.title}
                            </p>
                        )}
                        {barber.bio && (
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                                {barber.bio}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </SectionWrapper>
    );
};

export default Team;
