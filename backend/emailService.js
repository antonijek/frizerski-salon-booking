const { exec } = require("child_process");
const path = require("path");

// Email salonu - obavestenje o novom terminu (samo frizeru)
function sendSalonNotification(appointment) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");

    const subject = `🆕 Nov termin: ${name} - ${time}`;
    const body = `
Korisnik ${name} je upravo zakazao termin.

📋 Detalji:
───────────────
👤 Ime i prezime: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "nije unet"}
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
───────────────

Prijavi se na sajt da vidiš sve termine.
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
function sendCancellationNotification(appointment) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");

    // Salonu
    const salonSubject = `❌ Otkazan termin: ${name} - ${time}`;
    const salonBody = `
Korisnik ${name} je otkazao termin.

📋 Detalji otkazanog termina:
─────────────────
👤 Ime i prezime: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "nije unet"}
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
─────────────────
    `.trim();
    sendMail("knezantonije@gmail.com", salonSubject, salonBody);

    // Korisniku (ako ima email)
    if (email) {
        const customerSubject = `❌ Otkazivanje termina - Frizerski salon`;
        const customerBody = `
Poštovani ${name},

Vaš termin je uspešno otkazan.

📋 Detalji otkazanog termina:
─────────────────
📅 Datum: ${formattedDate}
⏰ Vreme: ${time}
💇 Usluga: ${service}
─────────────────

Ako želite da zakažete novi termin, posetite naš sajt.

Hvala što ste izabrali naš salon! ✂️

Frizerski salon
        `.trim();
        sendMail(email, customerSubject, customerBody);
    }
}

module.exports = {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
};
