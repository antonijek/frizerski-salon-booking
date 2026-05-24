const http = require("http");

const BASE = "http://127.0.0.1:5000";

const get = (path) =>
    new Promise((resolve, reject) => {
        http.get(BASE + path, (res) => {
            let d = "";
            res.on("data", (c) => (d += c));
            res.on("end", () => resolve({ status: res.statusCode, data: d }));
        }).on("error", reject);
    });

const post = (path, data, token) =>
    new Promise((resolve, reject) => {
        const s = JSON.stringify(data);
        const opts = {
            hostname: "127.0.0.1",
            port: 5000,
            path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(s),
            },
        };
        if (token) opts.headers["Authorization"] = `Bearer ${token}`;
        const req = http.request(opts, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () =>
                resolve({ status: res.statusCode, data: body }),
            );
        });
        req.on("error", reject);
        req.write(s);
        req.end();
    });

const put = (path, data, token) =>
    new Promise((resolve, reject) => {
        const s = JSON.stringify(data);
        const opts = {
            hostname: "127.0.0.1",
            port: 5000,
            path,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(s),
            },
        };
        if (token) opts.headers["Authorization"] = `Bearer ${token}`;
        const req = http.request(opts, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () =>
                resolve({ status: res.statusCode, data: body }),
            );
        });
        req.on("error", reject);
        req.write(s);
        req.end();
    });

const del = (path, token) =>
    new Promise((resolve, reject) => {
        const opts = {
            hostname: "127.0.0.1",
            port: 5000,
            path,
            method: "DELETE",
            headers: {},
        };
        if (token) opts.headers["Authorization"] = `Bearer ${token}`;
        const req = http.request(opts, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () =>
                resolve({ status: res.statusCode, data: body }),
            );
        });
        req.on("error", reject);
        req.end();
    });

const getWithToken = (path, token) =>
    new Promise((resolve, reject) => {
        const opts = {
            hostname: "127.0.0.1",
            port: 5000,
            path,
            method: "GET",
            headers: {},
        };
        if (token) opts.headers["Authorization"] = `Bearer ${token}`;
        const req = http.request(opts, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () =>
                resolve({ status: res.statusCode, data: body }),
            );
        });
        req.on("error", reject);
        req.end();
    });

let PASS = 0;
let FAIL = 0;
let adminToken = "";
let testAppointmentId = null;
let testUserId = null;

function test(name, condition, detail = "") {
    if (condition) {
        PASS++;
        console.log(`  ✅ ${name}`);
    } else {
        FAIL++;
        console.log(`  ❌ ${name} ${detail}`);
    }
}

(async () => {
    console.log("");
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║     🧪 KOMPLETNO TESTIRANJE API-JA          ║");
    console.log("╚══════════════════════════════════════════════╝");
    console.log("");

    // ============================================================
    // 1. JAVNE RUTE (ne zahtevaju autentifikaciju)
    // ============================================================
    console.log("─── 1. JAVNE RUTE ───────────────────────────────");

    let r;

    // 1.1 GET /api/services
    r = await get("/api/services");
    test("GET /api/services - status 200", r.status === 200, `(${r.status})`);
    let services = [];
    try {
        services = JSON.parse(r.data);
        test("GET /api/services - validan JSON", true);
        test(
            "GET /api/services - ima usluga",
            services.length > 0,
            `(${services.length})`,
        );
        test(
            "GET /api/services - svaka usluga ima name, duration, price",
            services.every((s) => s.name && s.duration && s.price),
        );
    } catch (e) {
        test("GET /api/services - validan JSON", false, "(nevalidan JSON)");
    }

    // 1.2 GET /api/barbers
    r = await get("/api/barbers");
    test("GET /api/barbers - status 200", r.status === 200, `(${r.status})`);
    let barbers = [];
    try {
        barbers = JSON.parse(r.data);
        test("GET /api/barbers - validan JSON", true);
        test(
            "GET /api/barbers - ima frizera",
            barbers.length > 0,
            `(${barbers.length})`,
        );
        test(
            "GET /api/barbers - svaki frizer ima id i name",
            barbers.every((b) => b.id && b.name),
        );
    } catch (e) {
        test("GET /api/barbers - validan JSON", false, "(nevalidan JSON)");
    }

    // 1.3 GET /api/appointments
    r = await get("/api/appointments");
    test(
        "GET /api/appointments - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const apps = JSON.parse(r.data);
        test("GET /api/appointments - validan JSON", true);
        test("GET /api/appointments - niz je", Array.isArray(apps));
    } catch (e) {
        test("GET /api/appointments - validan JSON", false, "(nevalidan JSON)");
    }

    // 1.4 GET /api/appointments/date/:date
    r = await get("/api/appointments/date/2026-05-25");
    test(
        "GET /api/appointments/date - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const apps = JSON.parse(r.data);
        test("GET /api/appointments/date - validan JSON", true);
    } catch (e) {
        test("GET /api/appointments/date - validan JSON", false);
    }

    // 1.5 GET /api/appointments/phone/:phone
    r = await get("/api/appointments/phone/061111111");
    test(
        "GET /api/appointments/phone - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const apps = JSON.parse(r.data);
        test("GET /api/appointments/phone - validan JSON", true);
    } catch (e) {
        test("GET /api/appointments/phone - validan JSON", false);
    }

    console.log("");

    // ============================================================
    // 2. KREIRANJE TERMINA (POST /api/appointments)
    // ============================================================
    console.log("─── 2. KREIRANJE TERMINA ────────────────────────");

    // 2.1 Kreiranje termina sa svim podacima
    r = await post("/api/appointments", {
        name: "Test Korisnik",
        phone: "061111111",
        email: "test@test.com",
        date: "2026-05-25",
        time: "10:00",
        service: "Šišanje",
    });
    test(
        "POST /api/appointments - status 201",
        r.status === 201,
        `(${r.status})`,
    );
    try {
        const data = JSON.parse(r.data);
        test("POST /api/appointments - vraca id", !!data.id);
        test("POST /api/appointments - vraca poruku", !!data.message);
        test("POST /api/appointments - dodeljen frizer", !!data.barber_id);
        testAppointmentId = data.id;
    } catch (e) {
        test("POST /api/appointments - validan JSON", false);
    }

    // 2.2 Kreiranje termina bez email-a (opciono polje)
    r = await post("/api/appointments", {
        name: "Test Bez Email",
        phone: "062222222",
        date: "2026-05-25",
        time: "11:00",
        service: "Feniranje",
    });
    test(
        "POST /api/appointments (bez email) - status 201",
        r.status === 201,
        `(${r.status})`,
    );

    // 2.3 Kreiranje termina bez obaveznih polja (treba da vrati 400)
    r = await post("/api/appointments", {
        name: "Test",
        // missing phone, date, time, service
    });
    test(
        "POST /api/appointments (bez obaveznih) - status 400",
        r.status === 400,
        `(${r.status})`,
    );
    try {
        const data = JSON.parse(r.data);
        test(
            "POST /api/appointments (bez obaveznih) - error poruka",
            !!data.error,
        );
    } catch (e) {
        test("POST /api/appointments (bez obaveznih) - validan JSON", false);
    }

    // 2.4 Kreiranje duplikata (isti datum, vreme - backend dodeljuje drugog frizera ako je slobodan)
    r = await post("/api/appointments", {
        name: "Test Duplikat",
        phone: "063333333",
        date: "2026-05-25",
        time: "10:00",
        service: "Šišanje",
    });
    test(
        "POST /api/appointments (duplikat) - status 201 (drugi frizer)",
        r.status === 201,
        `(${r.status})`,
    );

    // 2.5 Kreiranje za nedelju (kada niko ne radi)
    r = await post("/api/appointments", {
        name: "Test Nedelja",
        phone: "064444444",
        date: "2026-05-31",
        time: "10:00",
        service: "Šišanje",
    });
    test(
        "POST /api/appointments (nedelja) - status 201 ili 400",
        r.status === 201 || r.status === 400,
        `(${r.status})`,
    );
    if (r.status === 400) {
        try {
            const data = JSON.parse(r.data);
            test(
                "POST /api/appointments (nedelja) - error o neradnom danu",
                data.error && data.error.length > 0,
            );
        } catch (e) {}
    }

    console.log("");

    // ============================================================
    // 3. AUTH RUTE
    // ============================================================
    console.log("─── 3. AUTH ──────────────────────────────────────");

    // 3.1 Login sa validnim podacima
    r = await post("/api/auth/login", {
        email: "admin@salon.com",
        password: "admin123",
    });
    test(
        "POST /api/auth/login - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const data = JSON.parse(r.data);
        test("POST /api/auth/login - vraca token", !!data.token);
        test("POST /api/auth/login - vraca user objekat", !!data.user);
        test(
            "POST /api/auth/login - user ima id, name, email",
            data.user.id && data.user.name && data.user.email,
        );
        adminToken = data.token;
    } catch (e) {
        test("POST /api/auth/login - validan JSON", false);
    }

    // 3.2 Login sa pogresnim podacima
    r = await post("/api/auth/login", {
        email: "admin@example.com",
        password: "pogresna_lozinka",
    });
    test(
        "POST /api/auth/login (pogresna lozinka) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    r = await post("/api/auth/login", {
        email: "nepostojeci@email.com",
        password: "test123",
    });
    test(
        "POST /api/auth/login (nepostojeci email) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    // 3.3 Login bez podataka
    r = await post("/api/auth/login", {});
    test(
        "POST /api/auth/login (bez podataka) - status 400",
        r.status === 400,
        `(${r.status})`,
    );

    // 3.4 Registracija novog korisnika
    const testEmail = `test_${Date.now()}@test.com`;
    r = await post("/api/auth/register", {
        name: "Novi Korisnik",
        email: testEmail,
        password: "test123",
        phone: "065555555",
    });
    test(
        "POST /api/auth/register - status 201",
        r.status === 201,
        `(${r.status})`,
    );
    let userToken = "";
    try {
        const data = JSON.parse(r.data);
        test("POST /api/auth/register - vraca token", !!data.token);
        test("POST /api/auth/register - vraca user objekat", !!data.user);
        test("POST /api/auth/register - user nije admin", !data.user.isAdmin);
        userToken = data.token;
        testUserId = data.user.id;
    } catch (e) {
        test("POST /api/auth/register - validan JSON", false);
    }

    // 3.5 Registracija sa istim email-om (treba 409)
    r = await post("/api/auth/register", {
        name: "Drugi Korisnik",
        email: testEmail,
        password: "test456",
    });
    test(
        "POST /api/auth/register (duplikat email) - status 409",
        r.status === 409,
        `(${r.status})`,
    );

    // 3.6 Registracija bez obaveznih polja
    r = await post("/api/auth/register", {
        name: "Test",
        // missing email, password
    });
    test(
        "POST /api/auth/register (bez obaveznih) - status 400",
        r.status === 400,
        `(${r.status})`,
    );

    // 3.7 GET /api/auth/me (sa tokenom)
    r = await get("/api/auth/me");
    // Ovo bi trebalo da vrati 401 jer nemamo token u get zahtevu
    // (get ne salje Authorization header)
    test(
        "GET /api/auth/me (bez tokena) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    // GET /api/auth/me sa tokenom
    r = await getWithToken("/api/auth/me", adminToken);
    test(
        "GET /api/auth/me (sa tokenom) - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const data = JSON.parse(r.data);
        test(
            "GET /api/auth/me - vraca korisnika",
            !!data.id && !!data.name && !!data.email,
        );
    } catch (e) {
        test("GET /api/auth/me - validan JSON", false);
    }

    console.log("");

    // ============================================================
    // 4. ADMIN RUTE (zahtevaju admin token)
    // ============================================================
    console.log("─── 4. ADMIN RUTE ────────────────────────────────");

    // 4.1 GET /api/auth/users (samo admin)
    r = await get("/api/auth/users");
    test(
        "GET /api/auth/users (bez tokena) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    r = await getWithToken("/api/auth/users", userToken);
    test(
        "GET /api/auth/users (user token) - status 403",
        r.status === 403,
        `(${r.status})`,
    );

    r = await getWithToken("/api/auth/users", adminToken);
    test(
        "GET /api/auth/users (admin token) - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const users = JSON.parse(r.data);
        test(
            "GET /api/auth/users - niz korisnika",
            Array.isArray(users) && users.length > 0,
        );
    } catch (e) {
        test("GET /api/auth/users - validan JSON", false);
    }

    // 4.2 PUT /api/auth/users/:id (admin)
    if (testUserId) {
        r = await put(
            `/api/auth/users/${testUserId}`,
            {
                name: "Izmenjen Korisnik",
                email: testEmail,
                phone: "066666666",
                is_admin: false,
            },
            adminToken,
        );
        test(
            "PUT /api/auth/users/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 4.3 POST /api/services (admin)
    r = await post(
        "/api/services",
        {
            name: "Test Usluga",
            duration: 30,
            price: 25.0,
            description: "Test opis",
            icon: "✂️",
        },
        adminToken,
    );
    test(
        "POST /api/services (admin) - status 201",
        r.status === 201,
        `(${r.status})`,
    );
    let testServiceId = null;
    try {
        const data = JSON.parse(r.data);
        testServiceId = data.id;
        test("POST /api/services - vraca id", !!data.id);
    } catch (e) {}

    // 4.4 POST /api/services (bez admin tokena)
    r = await post("/api/services", {
        name: "Test Usluga 2",
        duration: 30,
        price: 20.0,
    });
    test(
        "POST /api/services (bez tokena) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    // 4.5 PUT /api/services/:id (admin)
    if (testServiceId) {
        r = await put(
            `/api/services/${testServiceId}`,
            {
                name: "Izmenjena Test Usluga",
                duration: 45,
                price: 30.0,
                description: "Izmenjen opis",
                icon: "💇",
            },
            adminToken,
        );
        test(
            "PUT /api/services/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 4.6 DELETE /api/services/:id (admin)
    if (testServiceId) {
        r = await del(`/api/services/${testServiceId}`, adminToken);
        test(
            "DELETE /api/services/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 4.7 POST /api/barbers (admin)
    r = await post(
        "/api/barbers",
        {
            name: "Test Frizer",
            work_days: "1,2,3,4,5,6",
            work_start: "09:00",
            work_end: "17:00",
        },
        adminToken,
    );
    test(
        "POST /api/barbers (admin) - status 201",
        r.status === 201,
        `(${r.status})`,
    );
    let testBarberId = null;
    try {
        const data = JSON.parse(r.data);
        testBarberId = data.id;
        test("POST /api/barbers - vraca id", !!data.id);
    } catch (e) {}

    // 4.8 PUT /api/barbers/:id (admin)
    if (testBarberId) {
        r = await put(
            `/api/barbers/${testBarberId}`,
            {
                name: "Izmenjen Test Frizer",
                is_active: true,
                work_days: "1,2,3,4,5",
                work_start: "10:00",
                work_end: "16:00",
            },
            adminToken,
        );
        test(
            "PUT /api/barbers/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 4.9 GET /api/barbers/all (admin)
    r = await getWithToken("/api/barbers/all", adminToken);
    test(
        "GET /api/barbers/all (admin) - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const allBarbers = JSON.parse(r.data);
        test("GET /api/barbers/all - niz frizera", Array.isArray(allBarbers));
    } catch (e) {}

    // 4.10 GET /api/appointments/stats (admin)
    r = await getWithToken("/api/appointments/stats", adminToken);
    test(
        "GET /api/appointments/stats (admin) - status 200",
        r.status === 200,
        `(${r.status})`,
    );
    try {
        const stats = JSON.parse(r.data);
        test(
            "GET /api/appointments/stats - ima totalAppointments",
            stats.totalAppointments !== undefined,
        );
        test(
            "GET /api/appointments/stats - ima totalUsers",
            stats.totalUsers !== undefined,
        );
        test(
            "GET /api/appointments/stats - ima totalRevenue",
            stats.totalRevenue !== undefined,
        );
        test(
            "GET /api/appointments/stats - ima todayAppointments",
            stats.todayAppointments !== undefined,
        );
        test(
            "GET /api/appointments/stats - ima appointmentsByService",
            Array.isArray(stats.appointmentsByService),
        );
        test(
            "GET /api/appointments/stats - ima appointmentsByBarber",
            Array.isArray(stats.appointmentsByBarber),
        );
        test(
            "GET /api/appointments/stats - ima monthlyStats",
            Array.isArray(stats.monthlyStats),
        );
        test(
            "GET /api/appointments/stats - ima monthlyRevenue",
            Array.isArray(stats.monthlyRevenue),
        );
    } catch (e) {
        test("GET /api/appointments/stats - validan JSON", false);
    }

    // 4.11 GET /api/appointments/stats (bez tokena)
    r = await get("/api/appointments/stats");
    test(
        "GET /api/appointments/stats (bez tokena) - status 401",
        r.status === 401,
        `(${r.status})`,
    );

    console.log("");

    // ============================================================
    // 5. IZMENA I BRISANJE TERMINA
    // ============================================================
    console.log("─── 5. IZMENA I BRISANJE TERMINA ────────────────");

    // 5.1 PUT /api/appointments/:id (izmena)
    if (testAppointmentId) {
        r = await put(`/api/appointments/${testAppointmentId}`, {
            name: "Izmenjen Korisnik",
            phone: "067777777",
            email: "izmenjen@test.com",
            date: "2026-05-25",
            time: "14:00",
            service: "Farbanje",
        });
        test(
            "PUT /api/appointments/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
        try {
            const data = JSON.parse(r.data);
            test(
                "PUT /api/appointments/:id - poruka o uspehu",
                data.message && data.message.includes("uspešno"),
            );
        } catch (e) {}

        // 5.2 Izmena na vec zauzet termin
        r = await put(`/api/appointments/${testAppointmentId}`, {
            name: "Izmenjen Korisnik",
            phone: "067777777",
            date: "2026-05-25",
            time: "11:00", // ovo vreme je zauzeto od strane "Test Bez Email"
            service: "Feniranje",
        });
        test(
            "PUT /api/appointments/:id (zauzet termin) - status 409",
            r.status === 409,
            `(${r.status})`,
        );

        // 5.3 Izmena nepostojeceg termina
        r = await put("/api/appointments/99999", {
            name: "Test",
            phone: "068888888",
            date: "2026-05-25",
            time: "15:00",
            service: "Šišanje",
        });
        test(
            "PUT /api/appointments/99999 (nepostojeci) - status 404",
            r.status === 404,
            `(${r.status})`,
        );

        // 5.4 DELETE /api/appointments/:id
        r = await del(`/api/appointments/${testAppointmentId}`);
        test(
            "DELETE /api/appointments/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
        try {
            const data = JSON.parse(r.data);
            test(
                "DELETE /api/appointments/:id - poruka o brisanju",
                data.message && data.message.includes("obrisan"),
            );
        } catch (e) {}

        // 5.5 Brisanje nepostojeceg termina
        r = await del("/api/appointments/99999");
        test(
            "DELETE /api/appointments/99999 (nepostojeci) - status 404",
            r.status === 404,
            `(${r.status})`,
        );
    }

    console.log("");

    // ============================================================
    // 6. BRISANJE KREIRANIH PODATAKA (cleanup)
    // ============================================================
    console.log("─── 6. CLEANUP ────────────────────────────────────");

    // 6.1 Brisanje test frizera
    if (testBarberId) {
        r = await del(`/api/barbers/${testBarberId}`, adminToken);
        test(
            "DELETE /api/barbers/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 6.2 Brisanje test korisnika
    if (testUserId) {
        r = await del(`/api/auth/users/${testUserId}`, adminToken);
        test(
            "DELETE /api/auth/users/:id - status 200",
            r.status === 200,
            `(${r.status})`,
        );
    }

    // 6.3 Brisanje samog sebe (treba da vrati 400)
    if (adminToken) {
        // Dohvati ID admina
        r = await getWithToken("/api/auth/me", adminToken);
        try {
            const me = JSON.parse(r.data);
            r = await del(`/api/auth/users/${me.id}`, adminToken);
            test(
                "DELETE /api/auth/users/:id (sam sebe) - status 400",
                r.status === 400,
                `(${r.status})`,
            );
        } catch (e) {}
    }

    console.log("");

    // ============================================================
    // 7. NEPOSTOJECE RUTE
    // ============================================================
    console.log("─── 7. NEPOSTOJECE RUTE ──────────────────────────");

    r = await get("/api/nepostojeca-ruta");
    test(
        "GET /api/nepostojeca-ruta - status 404",
        r.status === 404,
        `(${r.status})`,
    );

    r = await post("/api/nepostojeca-ruta", {});
    test(
        "POST /api/nepostojeca-ruta - status 404",
        r.status === 404,
        `(${r.status})`,
    );

    console.log("");

    // ============================================================
    // REZULTAT
    // ============================================================
    console.log("╔══════════════════════════════════════════════╗");
    console.log(
        `║  REZULTAT: ${PASS + FAIL} testova, ${PASS} ✅  ${FAIL} ❌        ║`,
    );
    console.log("╚══════════════════════════════════════════════╝");
    console.log("");

    if (FAIL > 0) {
        console.log("⚠️  Neki testovi nisu prošli. Proveri gornje ❌ oznake.");
        process.exit(1);
    } else {
        console.log("🎉 SVI TESTOVI SU PROŠLI!");
        process.exit(0);
    }
})();
