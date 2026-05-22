const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL konekcija
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Greška pri povezivanju sa bazom:", err);
        return;
    }
    console.log("Povezan na MySQL bazu");
});

// Rute
const appointmentRoutes = require("./routes/appointments");
const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
