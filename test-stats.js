const http = require("http");
const fs = require("fs");

const token = JSON.parse(fs.readFileSync("login.json", "utf8")).token;

const periods = ["all", "week", "month", "year"];

async function test() {
    for (const period of periods) {
        await new Promise((resolve, reject) => {
            const url = new URL(
                `http://localhost:5000/api/appointments/stats?period=${period}`,
            );
            const options = {
                hostname: "localhost",
                port: 5000,
                path: `/api/appointments/stats?period=${period}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            http.get(options, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    const json = JSON.parse(data);
                    console.log(`\n=== Period: ${period} ===`);
                    console.log(`totalAppointments: ${json.totalAppointments}`);
                    console.log(`totalRevenue: ${json.totalRevenue}`);
                    console.log(`todayAppointments: ${json.todayAppointments}`);
                    if (json.monthlyStats)
                        console.log(
                            `monthlyStats:`,
                            JSON.stringify(json.monthlyStats),
                        );
                    if (json.monthlyRevenue)
                        console.log(
                            `monthlyRevenue:`,
                            JSON.stringify(json.monthlyRevenue),
                        );
                    resolve();
                });
            }).on("error", reject);
        });
    }
}

test()
    .then(() => console.log("\nDone!"))
    .catch(console.error);
