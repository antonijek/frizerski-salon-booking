const http = require("http");

const BASE_URL = "http://localhost:5000";
let token = "";
let testResults = { passed: 0, failed: 0, errors: [] };

function request(method, path, body = null, authToken = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: { "Content-Type": "application/json" },
        };
        if (authToken) options.headers["Authorization"] = `Bearer ${authToken}`;

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on("error", reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function test(name, fn) {
    return fn()
        .then((result) => {
            if (result.passed) {
                console.log(`  ✅ ${name}`);
                testResults.passed++;
            } else {
                console.log(`  ❌ ${name} - ${result.error}`);
                testResults.failed++;
                testResults.errors.push({ name, error: result.error });
            }
        })
        .catch((err) => {
            console.log(`  ❌ ${name} - ${err.message}`);
            testResults.failed++;
            testResults.errors.push({ name, error: err.message });
        });
}

async function runTests() {
    console.log("\n========================================");
    console.log("  SVEUKUPNO TESTIRANJE SAJTA");
    console.log("========================================\n");

    // === 1. TESTIRANJE JAVNIH API ENDPOINTA ===
    console.log("📌 1. JAVNI API ENDPOINTI");
    console.log("----------------------------------------");

    await test("GET /api/services - Dohvatanje usluga", async () => {
        const res = await request("GET", "/api/services");
        if (res.status !== 200)
            return { passed: false, error: `Status ${res.status}` };
        if (!Array.isArray(res.data))
            return { passed: false, error: "Odgovor nije niz" };
        if (res.data.length === 0)
            return { passed: false, error: "Nema usluga u bazi" };
        const hasRequiredFields = res.data.every(
            (s) => s.name && s.price && s.duration,
        );
        if (!hasRequiredFields)
            return {
                passed: false,
                error: "Nedostaju obavezna polja (name, price, duration)",
            };
        return { passed: true };
    });

    await test("GET /api/barbers - Dohvatanje berbera", async () => {
        const res = await request("GET", "/api/barbers");
        if (res.status !== 200)
            return { passed: false, error: `Status ${res.status}` };
        if (!Array.isArray(res.data))
            return { passed: false, error: "Odgovor nije niz" };
        if (res.data.length === 0)
            return { passed: false, error: "Nema berbera u bazi" };
        return { passed: true };
    });

    await test("GET /api/gallery - Dohvatanje galerije", async () => {
        const res = await request("GET", "/api/gallery");
        if (res.status !== 200)
            return { passed: false, error: `Status ${res.status}` };
        if (!Array.isArray(res.data))
            return { passed: false, error: "Odgovor nije niz" };
        return { passed: true };
    });

    await test("GET /api/appointments (bez tokena) - Treba vratiti 401", async () => {
        const res = await request("GET", "/api/appointments");
        if (res.status === 401) return { passed: true };
        return { passed: false, error: `Status ${res.status} (očekivan 401)` };
    });

    // === 2. TESTIRANJE AUTH ENDPOINTA ===
    console.log("\n📌 2. AUTH ENDPOINTI (Registracija/Prijava)");
    console.log("----------------------------------------");

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "Test123!";

    await test("POST /api/auth/register - Registracija novog korisnika", async () => {
        const res = await request("POST", "/api/auth/register", {
            name: "Test Korisnik",
            email: testEmail,
            password: testPassword,
        });
        if (res.status !== 201 && res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        if (!res.data.token)
            return { passed: false, error: "Nema tokena u odgovoru" };
        token = res.data.token;
        return { passed: true };
    });

    await test("POST /api/auth/login - Prijava sa ispravnim kredencijalima", async () => {
        const res = await request("POST", "/api/auth/login", {
            email: testEmail,
            password: testPassword,
        });
        if (res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        if (!res.data.token)
            return { passed: false, error: "Nema tokena u odgovoru" };
        token = res.data.token;
        return { passed: true };
    });

    await test("POST /api/auth/login - Prijava sa pogrešnom lozinkom", async () => {
        const res = await request("POST", "/api/auth/login", {
            email: testEmail,
            password: "WrongPassword123!",
        });
        if (res.status === 401 || res.status === 400) return { passed: true };
        return {
            passed: false,
            error: `Status ${res.status} (očekivan 401/400)`,
        };
    });

    await test("GET /api/auth/me - Dohvatanje profila sa validnim tokenom", async () => {
        const res = await request("GET", "/api/auth/me", null, token);
        if (res.status !== 200)
            return { passed: false, error: `Status ${res.status}` };
        if (!res.data.email)
            return { passed: false, error: "Nema email u odgovoru" };
        return { passed: true };
    });

    await test("GET /api/auth/me - Dohvatanje profila bez tokena (401)", async () => {
        const res = await request("GET", "/api/auth/me");
        if (res.status === 401) return { passed: true };
        return { passed: false, error: `Status ${res.status} (očekivan 401)` };
    });

    // === 3. TESTIRANJE APPOINTMENT ENDPOINTA ===
    console.log("\n📌 3. APPOINTMENT ENDPOINTI");
    console.log("----------------------------------------");

    let appointmentId = null;

    await test("GET /api/appointments (sa tokenom) - Dohvatanje termina", async () => {
        const res = await request("GET", "/api/appointments", null, token);
        if (res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        return { passed: true };
    });

    await test("POST /api/appointments - Kreiranje novog termina", async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        const res = await request(
            "POST",
            "/api/appointments",
            {
                service_id: 1,
                barber_id: 1,
                appointment_date: dateStr,
                appointment_time: "10:00",
                client_name: "Test Klijent",
                client_email: testEmail,
                client_phone: "0601234567",
                notes: "Test termin",
            },
            token,
        );

        if (res.status !== 201 && res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        if (res.data.id) appointmentId = res.data.id;
        return { passed: true };
    });

    await test("POST /api/appointments/check - Provera dostupnosti termina", async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        const res = await request("POST", "/api/appointments/check", {
            barber_id: 1,
            date: dateStr,
            time: "14:00",
        });
        if (res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        return { passed: true };
    });

    await test("GET /api/appointments/available-slots - Dostupni termini", async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        const res = await request(
            "GET",
            `/api/appointments/available-slots?barber_id=1&date=${dateStr}`,
        );
        if (res.status !== 200)
            return {
                passed: false,
                error: `Status ${res.status}: ${JSON.stringify(res.data)}`,
            };
        return { passed: true };
    });

    // === 4. TESTIRANJE ADMIN ENDPOINTA ===
    console.log("\n📌 4. ADMIN ENDPOINTI");
    console.log("----------------------------------------");

    await test("GET /api/admin/services (bez admin tokena) - Treba vratiti 403", async () => {
        const res = await request("GET", "/api/admin/services", null, token);
        if (res.status === 403 || res.status === 401) return { passed: true };
        return {
            passed: false,
            error: `Status ${res.status} (očekivan 403/401)`,
        };
    });

    await test("GET /api/admin/users (bez admin tokena) - Treba vratiti 403", async () => {
        const res = await request("GET", "/api/admin/users", null, token);
        if (res.status === 403 || res.status === 401) return { passed: true };
        return {
            passed: false,
            error: `Status ${res.status} (očekivan 403/401)`,
        };
    });

    // === 5. TESTIRANJE FRONTEND ===
    console.log("\n📌 5. FRONTEND TESTIRANJE");
    console.log("----------------------------------------");

    await test("GET http://localhost:5173/ - Frontend početna stranica", async () => {
        return new Promise((resolve, reject) => {
            http.get("http://localhost:5173/", (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    if (res.statusCode === 200) {
                        if (
                            data.includes("root") ||
                            data.includes("html") ||
                            data.includes("div")
                        ) {
                            resolve({ passed: true });
                        } else {
                            resolve({
                                passed: false,
                                error: "HTML ne sadrži očekivani sadržaj",
                            });
                        }
                    } else {
                        resolve({
                            passed: false,
                            error: `Status ${res.statusCode}`,
                        });
                    }
                });
            }).on("error", reject);
        });
    });

    // === 6. PROVERA BAZE PODATAKA ===
    console.log("\n📌 6. PROVERA BAZE PODATAKA");
    console.log("----------------------------------------");

    await test("Provera da li backend komunicira sa bazom", async () => {
        const res = await request("GET", "/api/services");
        if (res.status === 200 && Array.isArray(res.data))
            return { passed: true };
        return { passed: false, error: "Backend ne vraća podatke iz baze" };
    });

    // === REZULTATI ===
    console.log("\n========================================");
    console.log("  REZULTATI TESTIRANJA");
    console.log("========================================");
    console.log(`  ✅ Uspešno: ${testResults.passed}`);
    console.log(`  ❌ Neuspešno: ${testResults.failed}`);
    console.log(`  📊 Ukupno: ${testResults.passed + testResults.failed}`);

    if (testResults.errors.length > 0) {
        console.log("\n  GREŠKE:");
        testResults.errors.forEach((e) => {
            console.log(`    ❌ ${e.name}: ${e.error}`);
        });
    }

    console.log("\n========================================\n");

    process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    console.error("Fatalna greška:", err);
    process.exit(1);
});
