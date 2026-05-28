const { exec } = require("child_process");
const path = require("path");

// Email salonu - obavestenje o novom terminu (samo frizeru)
function sendSalonNotification(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";
    const salonEmail = salon?.email || "knezantonije@gmail.com";

    const subject = `🆕 Nov termin: ${name} - ${time} (${salonName})`;
    const body = `
Korisnik ${name} je upravo zakazao termin u salonu ${salonName}.

📋 Detalji:
───────────────
👤 Ime i prezime: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "nije unet"}
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
🏪 Salon: ${salonName}
───────────────

Prijavi se na sajt da vidiš sve termine.
    `.trim();

    sendMail(salonEmail, subject, body, salonName);
}

// Email korisniku - potvrda termina
function sendCustomerConfirmation(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";

    const subject = `✅ Potvrda termina - ${salonName}`;
    const body = `
Poštovani ${name},

Vaš termin je uspešno zakazan u salonu ${salonName}!

📋 Detalji termina:
───────────────
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
🏪 Salon: ${salonName}
───────────────

Hvala što ste izabrali ${salonName}! ✂️

${salonName}
    `.trim();

    if (email) {
        sendMail(email, subject, body, salonName);
    }
}

function sendMail(to, subject, body, salonName) {
    const from = "knezantonije@gmail.com";
    const emailContent = `From: ${salonName || "Frizerski salon"} <${from}>
To: ${to}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit

${body}`;

    const fs = require("fs");
    // Koristi unique naziv fajla da se ne bi prepisivali
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const tmpFile = path.join(
        __dirname,
        `temp_email_${timestamp}_${random}.txt`,
    );

    fs.writeFileSync(tmpFile, emailContent, "utf8");

    exec(`msmtp -a default ${to} < "${tmpFile}"`, (error, stdout, stderr) => {
        // Obrisi privremeni fajl
        try {
            if (fs.existsSync(tmpFile)) {
                fs.unlinkSync(tmpFile);
            }
        } catch (e) {
            // ignore
        }

        if (error) {
            console.error("Greška pri slanju mejla:", stderr || error.message);
        } else {
            console.log(`Mejl poslat na ${to}`);
        }
    });
}

// Email salonu i korisniku - otkazivanje termina
function sendCancellationNotification(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";
    const salonEmail = salon?.email || "knezantonije@gmail.com";

    // Salonu
    const salonSubject = `❌ Otkazan termin: ${name} - ${time} (${salonName})`;
    const salonBody = `
Korisnik ${name} je otkazao termin u salonu ${salonName}.

📋 Detalji otkazanog termina:
─────────────────
👤 Ime i prezime: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "nije unet"}
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
🏪 Salon: ${salonName}
─────────────────
    `.trim();
    sendMail(salonEmail, salonSubject, salonBody, salonName);

    // Korisniku (ako ima email)
    if (email) {
        const customerSubject = `❌ Otkazivanje termina - ${salonName}`;
        const customerBody = `
Poštovani ${name},

Vaš termin je uspešno otkazan u salonu ${salonName}.

📋 Detalji otkazanog termina:
─────────────────
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
🏪 Salon: ${salonName}
─────────────────

Ako želite da zakažete novi termin, posetite naš sajt.

Hvala što ste izabrali ${salonName}! ✂️

${salonName}
        `.trim();
        sendMail(email, customerSubject, customerBody, salonName);
    }
}

module.exports = {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
};
