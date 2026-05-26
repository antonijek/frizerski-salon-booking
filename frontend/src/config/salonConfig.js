// ============================================
// SALON CONFIG - Ovde menjas za svakog kupca
// ============================================

const salonConfig = {
    // Osnovne informacije
    name: "Frizerski Salon",
    shortName: "Salon",
    tagline: "Profesionalna nega vaše kose",
    description: "Dobrodošli u naš salon gde vaša kosa dobija najbolju negu.",

    // Kontakt
    contact: {
        phone: "+381 61 234 567",
        email: "info@salon.rs",
        address: "Ulica bb, Grad",
    },

    // Radno vreme
    workingHours: {
        start: "09:00",
        end: "17:00",
        interval: 30, // minuta izmedju termina
        daysOpen: [1, 2, 3, 4, 5, 6], // 0=nedelja, 1=ponedeljak...
    },

    // Teme (boje)
    theme: {
        mode: "light", // 'light' | 'dark'

        // Primarne boje (za dugmad, linkove, akcente)
        primary: {
            50: "amber-50",
            100: "amber-100",
            200: "amber-200",
            300: "amber-300",
            400: "amber-400",
            500: "amber-500",
            600: "amber-600",
            700: "amber-700",
            800: "amber-800",
            900: "amber-900",
        },

        // Neutralne boje (za tekst, pozadine)
        neutral: {
            50: "gray-50",
            100: "gray-100",
            200: "gray-200",
            300: "gray-300",
            400: "gray-400",
            500: "gray-500",
            600: "gray-600",
            700: "gray-700",
            800: "gray-800",
            900: "gray-900",
        },

        // Status boje
        success: "green",
        error: "red",
        warning: "yellow",
        info: "blue",
    },

    // Navigacija
    navigation: [
        { label: "Početna", path: "/", icon: "🏠" },
        { label: "Usluge", path: "/usluge", icon: "✂️" },
        { label: "Frizeri", path: "/tim", icon: "🧔" },
        { label: "Zakaži", path: "/zakazi", icon: "📅" },
        { label: "Moj profil", path: "/moj-profil", icon: "👤" },
        { label: "Kontakt", path: "/kontakt", icon: "📞" },
    ],

    // Footer
    footer: {
        copyright: `© ${new Date().getFullYear()} Frizerski Salon. Sva prava zadržana.`,
        social: {
            facebook: "https://facebook.com/",
            instagram: "https://instagram.com/",
        },
    },

    // Booking podešavanja
    booking: {
        maxDaysAhead: 90, // koliko dana unapred moze da se zakaze
        minHoursBefore: 2, // minimalno sati pre termina
    },

    // Galerija
    gallery: {
        enabled: true,
        title: "Naša galerija",
        subtitle: "Pogledajte neke od naših radova",
        images: [
            {
                src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop",
                alt: "Frizura 1",
                category: "Šišanje",
            },
            {
                src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
                alt: "Frizura 2",
                category: "Farbanje",
            },
            {
                src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop",
                alt: "Frizura 3",
                category: "Feniranje",
            },
            {
                src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop",
                alt: "Frizura 4",
                category: "Šišanje",
            },
            {
                src: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop",
                alt: "Frizura 5",
                category: "Farbanje",
            },
            {
                src: "https://images.unsplash.com/photo-1634302086195-76c43c3e2e4f?w=600&h=600&fit=crop",
                alt: "Frizura 6",
                category: "Feniranje",
            },
        ],
    },

    // Tim
    team: {
        enabled: true,
        title: "Naš tim",
        subtitle: "Upoznajte naše profesionalne frizere",
        members: [
            {
                name: "Marija Petrović",
                role: "Senior frizer",
                description:
                    "Sa preko 10 godina iskustva, specijalizovana za moderne tehnike šišanja i farbanja.",
                image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop",
            },
            {
                name: "Jovan Jovanović",
                role: "Barber",
                description:
                    "Stručnjak za muške frizure i brijanje, sa više od 8 godina iskustva.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
            },
            {
                name: "Ana Nikolić",
                role: "Kolorista",
                description:
                    "Specijalista za bojenje kose i balayage tehnike. Stalno prati najnovije trendove.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop",
            },
        ],
    },

    // Testimonijali
    testimonials: {
        enabled: true,
        title: "Šta kažu naše mušterije",
        subtitle: "Utisci zadovoljnih klijenata",
        items: [
            {
                name: "Milica Đorđević",
                text: "Najbolji frizerski salon u gradu! Profesionalan pristup, ljubazno osoblje i vrhunski rezultati. Preporučujem svima!",
                rating: 5,
            },
            {
                name: "Nikola Stojanović",
                text: "Odlično šišanje i brijanje. Jovan je pravi majstor svog zanata. Dolazim redovno već dve godine.",
                rating: 5,
            },
            {
                name: "Sandra Ilić",
                text: "Ana je napravila predivan balayage! Tačno onako kako sam želela. Cenovnik je pristupačan, a kvalitet vrhunski.",
                rating: 5,
            },
            {
                name: "Marko Pavlović",
                text: "Super usluga, lako zakazivanje preko sajta. Salon je čist i prijatan. Sve pohvale!",
                rating: 4,
            },
        ],
    },
};

export default salonConfig;
