const http = require("http");
const fs = require("fs");

const token = JSON.parse(fs.readFileSync("login.json", "utf8")).token;

// Dohvati sve termine da vidimo datume
http.get(
    {
        hostname: "localhost",
        port: 5000,
        path: "/api/appointments",
        headers: { Authorization: "Bearer " + token },
    },
    (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
            const apps = JSON.parse(data);
            console.log("Svi termini po datumima:");
            const byDate = {};
            apps.forEach((a) => {
                if (!byDate[a.date]) byDate[a.date] = [];
                byDate[a.date].push(a.time + " " + a.name);
            });
            Object.keys(byDate)
                .sort()
                .forEach((d) => {
                    console.log("  " + d + ": " + byDate[d].join(", "));
                });

            // Proveri koliko ima termina starijih od 7 dana
            const today = new Date("2026-05-25");
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);

            const all = apps.length;
            const week = apps.filter((a) => new Date(a.date) >= weekAgo).length;
            const month = apps.filter(
                (a) => new Date(a.date) >= monthAgo,
            ).length;
            const year = apps.filter((a) => new Date(a.date) >= yearAgo).length;

            console.log("\nOcekivani brojevi:");
            console.log("  Sve vreme: " + all);
            console.log("  Poslednja sedmica: " + week);
            console.log("  Poslednji mesec: " + month);
            console.log("  Poslednja godina: " + year);
        });
    },
);
