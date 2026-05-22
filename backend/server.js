const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
