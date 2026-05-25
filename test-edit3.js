const http = require("http");

const data = JSON.stringify({
    name: "Test Sva Polja",
    phone: "069999994",
    email: "sva.polja@test.com",
    date: "2026-05-26",
    time: "09:00",
    service: "Balayage",
    barber_id: 4,
});

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/appointments/60",
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
    },
};

const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", body);
    });
});

req.on("error", (e) => console.error("Error:", e.message));
req.write(data);
req.end();
