const db = require("./backend/db");
db.query("SELECT * FROM barbers", (err, results) => {
    if (err) {
        console.error("Error:", err);
        process.exit(1);
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit();
});
