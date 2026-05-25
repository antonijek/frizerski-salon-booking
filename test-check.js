const db = require("./backend/db");

db.query(
    'SELECT a.id, a.time, a.service, a.barber_id, s.duration FROM appointments a LEFT JOIN services s ON a.service = s.name WHERE a.date = "2026-05-26" ORDER BY a.time',
    (err, results) => {
        if (err) {
            console.error("Error:", err);
            process.exit(1);
        }
        console.log("Appointments for 2026-05-26:");
        console.log(JSON.stringify(results, null, 2));

        // Simuliraj logiku iz useBookingForm.js
        const barbers = [
            { id: 1, name: "Jovana", is_active: true },
            { id: 2, name: "Cakana", is_active: true },
            { id: 3, name: "Marko", is_active: true },
        ];

        const workingHours = { interval: 30 };

        const slotBookings = {};
        results.forEach((a) => {
            const startTime = a.time.slice(0, 5);
            const duration = a.duration || 30;
            const [h, m] = startTime.split(":").map(Number);
            const startMinutes = h * 60 + m;
            const endMinutes = startMinutes + duration;

            for (let m = startMinutes; m < endMinutes; m += 30) {
                const slotH = Math.floor(m / 60);
                const slotMin = m % 60;
                const slot = `${slotH.toString().padStart(2, "0")}:${slotMin.toString().padStart(2, "0")}`;

                if (!slotBookings[slot]) {
                    slotBookings[slot] = new Set();
                }
                slotBookings[slot].add(a.barber_id);
                console.log(
                    `  Slot ${slot}: barber_id=${a.barber_id} (${a.barber_id ? "added" : "NULL - NOT ADDED?"})`,
                );
            }
        });

        console.log("\nSlot bookings summary:");
        Object.entries(slotBookings).forEach(([slot, bookedBarberIds]) => {
            console.log(`  ${slot}: [${[...bookedBarberIds].join(", ")}]`);
        });

        const activeBarberIds = barbers
            .filter((b) => b.is_active !== false)
            .map((b) => b.id);
        console.log("\nActive barber IDs:", activeBarberIds);

        const blockedSlots = new Set();
        Object.entries(slotBookings).forEach(([slot, bookedBarberIds]) => {
            const allBusy = activeBarberIds.every((id) =>
                bookedBarberIds.has(id),
            );
            console.log(
                `  ${slot}: bookedBarbers=[${[...bookedBarberIds].join(", ")}], allBusy=${allBusy}`,
            );
            if (allBusy) {
                blockedSlots.add(slot);
            }
        });

        console.log("\nBlocked slots:", [...blockedSlots]);
        process.exit();
    },
);
