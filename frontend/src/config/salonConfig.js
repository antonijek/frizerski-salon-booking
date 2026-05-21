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

    // Usluge
    services: [
        {
            id: 1,
            name: "Šišanje",
            duration: 30,
            price: 15.0,
            description: "Šišanje makazama ili mašinicom",
            icon: "✂️",
        },
        {
            id: 2,
            name: "Farbanje",
            duration: 90,
            price: 40.0,
            description: "Farbanje cele kose",
            icon: "🎨",
        },
        {
            id: 3,
            name: "Pranje i feniranje",
            duration: 45,
            price: 20.0,
            description: "Pranje i feniranje kose",
            icon: "💆",
        },
        {
            id: 4,
            name: "Šišanje i feniranje",
            duration: 60,
            price: 30.0,
            description: "Šišanje sa feniranjem",
            icon: "💇",
        },
        {
            id: 5,
            name: "Brijački poslovi",
            duration: 20,
            price: 10.0,
            description: "Brijanje brade i glave",
            icon: "🪒",
        },
        {
            id: 6,
            name: "Tretman za kosu",
            duration: 45,
            price: 25.0,
            description: "Hranljivi tretman za kosu",
            icon: "✨",
        },
    ],

    // Navigacija
    navigation: [
        { label: "Početna", path: "/", icon: "🏠" },
        { label: "Usluge", path: "/usluge", icon: "✂️" },
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
        maxDaysAhead: 30, // koliko dana unapred moze da se zakaze
        minHoursBefore: 2, // minimalno sati pre termina
    },
};

export default salonConfig;
