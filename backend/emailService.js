const { exec } = require("child_process");
const path = require("path");

// Email salonu - obavestenje o novom terminu
function sendSalonNotification(appointment) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");

    const subject = `🆕 Novi termin - ${name}`;
    const body = `
Novi termin je zakazan!

📋 Detalji termina:
───────────────
👤 Ime: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "nije unet"}
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
───────────────

Prijatan dan! ✂️
    `.trim();

    sendMail("knezantonije@gmail.com", subject, body);
}

// Email korisniku - potvrda termina
function sendCustomerConfirmation(appointment) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");

    const subject = `✅ Potvrda termina - Frizerski salon`;
    const body = `
Poštovani ${name},

Vaš termin je uspešno zakazan!

📋 Detalji termina:
───────────────
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
───────────────

Hvala što ste izabrali naš salon! ✂️

Frizerski salon
    `.trim();

    if (email) {
        sendMail(email, subject, body);
    }
}

function sendMail(to, subject, body) {
    const from = "knezantonije@gmail.com";
    const emailContent = `From: ${from}
To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset=UTF-8

${body}`;

    // Privremeni fajl sa sadrzajem mejla
    const tmpFile = path.join(__dirname, "temp_email.txt");

    const fs = require("fs");
    fs.writeFileSync(tmpFile, emailContent, "utf8");

    exec(`msmtp -a default ${to} < "${tmpFile}"`, (error, stdout, stderr) => {
        // Obrisi privremeni fajl
        fs.unlinkSync(tmpFile);

        if (error) {
            console.error("Greška pri slanju mejla:", stderr || error.message);
        } else {
            console.log(`Mejl poslat na ${to}`);
        }
    });
}

module.exports = { sendSalonNotification, sendCustomerConfirmation };
