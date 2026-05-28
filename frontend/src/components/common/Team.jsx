import { useState, useEffect } from "react";
import salonConfig from "../../config/salonConfig";
import SectionWrapper from "./SectionWrapper";
import barberService from "../../services/barberService";

// ============================================
// Team - Sekcija za prikaz tima frizera
// ============================================

// Mapa dana: 1=Pon, 2=Uto, ..., 7=Ned
const DAY_NAMES = {
    1: "Pon",
    2: "Uto",
    3: "Sre",
    4: "Čet",
    5: "Pet",
    6: "Sub",
    7: "Ned",
};

const formatWorkDays = (workDaysStr) => {
    if (!workDaysStr) return "";
    const days = workDaysStr
        .split(",")
        .map((d) => d.trim())
        .sort();
    // Ako su svi dani, vrati "Svaki dan"
    if (days.length === 7) return "Svaki dan";
    // Ako je pon-sub (1-6)
    if (
        days.length === 6 &&
        days.every((d) => ["1", "2", "3", "4", "5", "6"].includes(d))
    ) {
        return "Pon - Sub";
    }
    // Ako je pon-pet (1-5)
    if (
        days.length === 5 &&
        days.every((d) => ["1", "2", "3", "4", "5"].includes(d))
    ) {
        return "Pon - Pet";
    }
    // Inače prikaži skraćenice
    return days.map((d) => DAY_NAMES[d] || d).join(", ");
};

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
                    <div
                        key={barber.id}
                        className="group text-center flex flex-col h-full"
                    >
                        {/* Slika */}
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <div className="w-full h-full rounded-full overflow-hidden ring-primary-light group-hover:ring-primary transition-all duration-300">
                                {barber.image_url ? (
                                    <img
                                        src={barber.image_url}
                                        alt={barber.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-primary-solid flex items-center justify-center">
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
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-light rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-primary-light rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                        </div>

                        {/* Info */}
                        <h3 className="text-xl font-semibold text-primary-dark mb-1 group-hover:text-primary-hover transition-colors">
                            {barber.name}
                        </h3>
                        {barber.title && (
                            <p className="text-primary font-medium text-sm mb-3">
                                {barber.title}
                            </p>
                        )}
                        {barber.bio && (
                            <p className="text-primary-light text-sm leading-relaxed max-w-xs mx-auto">
                                {barber.bio}
                            </p>
                        )}

                        {/* Radno vreme - mt-auto da bude u istom redu */}
                        {(barber.work_start || barber.work_days) && (
                            <div className="mt-auto pt-4 space-y-1 text-sm text-primary-light">
                                {barber.work_start && barber.work_end && (
                                    <p className="flex items-center justify-center gap-1">
                                        <span>🕐</span>
                                        <span>
                                            {barber.work_start} -{" "}
                                            {barber.work_end}
                                        </span>
                                    </p>
                                )}
                                {barber.work_days && (
                                    <p className="flex items-center justify-center gap-1">
                                        <span>📅</span>
                                        <span>
                                            {formatWorkDays(barber.work_days)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SectionWrapper>
    );
};

export default Team;
