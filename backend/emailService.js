const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER || "knezantonije@gmail.com",
        pass: process.env.SMTP_PASS,
    },
});

function sendSalonNotification(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";
    const salonEmail = salon?.email || "knezantonije@gmail.com";

    const subject = `Nov termin: ${name} - ${time} (${salonName})`;
    const text = `
Korisnik ${name} je upravo zakazao termin u salonu ${salonName}.

Detalji:
Ime: ${name}
Telefon: ${phone}
Email: ${email || "nije unet"}
Datum: ${formattedDate}
Vreme: ${time}
Usluga: ${service}
Salon: ${salonName}

Prijavi se na sajt da vidis sve termine.
    `.trim();

    sendMail(salonEmail, subject, text);
}

function sendCustomerConfirmation(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";

    const subject = `Potvrda termina - ${salonName}`;
    const text = `
Postovani ${name},

Vas termin je uspesno zakazan u salonu ${salonName}!

Detalji termina:
Datum: ${formattedDate}
Vreme: ${time}
Usluga: ${service}
Salon: ${salonName}

Hvala sto ste izabrali ${salonName}!
    `.trim();

    if (email) {
        sendMail(email, subject, text, salonName);
    }
}

function sendMail(to, subject, text, replyToName) {
    transporter.sendMail(
        {
            from: `"${replyToName || "Frizerski salon"}" <${process.env.SMTP_USER || "knezantonije@gmail.com"}>`,
            to,
            subject,
            text,
        },
        (error, info) => {
            if (error) {
                console.error("Greska pri slanju mejla:", error.message);
            } else {
                console.log(`Mejl poslat na ${to} (${info.messageId})`);
            }
        },
    );
}

function sendCancellationNotification(appointment, salon) {
    const { name, phone, email, date, time, service } = appointment;
    const formattedDate = new Date(date).toLocaleDateString("sr-RS");
    const salonName = salon?.name || "Frizerski salon";
    const salonEmail = salon?.email || "knezantonije@gmail.com";

    const salonSubject = `Otkazan termin: ${name} - ${time} (${salonName})`;
    const salonBody = `
Korisnik ${name} je otkazao termin u salonu ${salonName}.

Detalji otkazanog termina:
Ime: ${name}
Telefon: ${phone}
Email: ${email || "nije unet"}
Datum: ${formattedDate}
Vreme: ${time}
Usluga: ${service}
Salon: ${salonName}
    `.trim();
    sendMail(salonEmail, salonSubject, salonBody, salonName);

    if (email) {
        const customerSubject = `Otkazivanje termina - ${salonName}`;
        const customerBody = `
Postovani ${name},

Vas termin je uspesno otkazan u salonu ${salonName}.

Detalji otkazanog termina:
Datum: ${formattedDate}
Vreme: ${time}
Usluga: ${service}
Salon: ${salonName}

Ako zelite da zakazete novi termin, posetite nas sajt.
        `.trim();
        sendMail(email, customerSubject, customerBody, salonName);
    }
}

module.exports = {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
};
