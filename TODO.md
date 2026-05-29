# TODO - Frizerski salon booking

## Trenutno stanje (29.05.2026)

Sve radi. Backend na portu 5000, frontend na 5173.
**Multi-subdomain setup je spreman.**

### ✅ Urađeno u ovoj sesiji: Uklonjen Docker, multi-subdomain kompletiran

- [x] Obrisani Docker fajlovi
- [x] Prepravljen `deploy-frontend.sh` — deploy bez Dockera, wildcard nginx
- [x] Template kloniranje: `POST /api/salons/` automatski kopira usluge i barbere iz main salona
- [x] Email: `msmtp` → `nodemailer` (dodat SMTP config u `.env`)
- [x] Verifikovano: `init-db.js`, `schema.sql`, `auth.js`, `gallery.js` već imaju `salon_id`

---

## Završeno ✅

- [x] Docker uklonjen (nepotreban za jedan server)
- [x] Multi-subdomain arhitektura kompletna
- [x] salonContext middleware — subdomain → salon_id lookup
- [x] Super admin panel — SaloniTab (kreiranje, brisanje, switch context, user management)
- [x] SalonForm — forma za kreiranje novog salona sa subdomain-om
- [x] Template kloniranje — novi salon dobija usluge i barbere automatski
- [x] Auth — registracija/login sa salon_id, super admin rute
- [x] Gallery — sve rute koriste req.salonId
- [x] Email — nodemailer umjesto msmtp-a
- [x] Error handling — AppError + global errorHandler middleware
- [x] APPOINTMENTS - Uklonjena `status` kolona

## Sledeće 🔧

### 1. 🔧 WILDCARD SSL — Let's Encrypt (jednom na serveru)

```bash
certbot certonly --manual --preferred-challenges dns \
  -d "*.frizerski-salon.com" -d frizerski-salon.com
```

### 2. 🔧 SMTP_PASS — Podesi Gmail App Password

1. Idi na https://myaccount.google.com/apppasswords
2. Napravi app password za "Mail"
3. Dodaj u `backend/.env`: `SMTP_PASS=xxxx xxxx xxxx xxxx`

### 3. 🔧 Prvi deploy na server

```bash
bash deploy-frontend.sh
```

---

## Deploy

```bash
bash deploy-frontend.sh
```

Skripta radi automatski:
1. Build frontend
2. Upload na server
3. Pull backend kod + npm install
4. Nginx wildcard konfig
5. pm2 restart

---

## Sinhronizacija baze

### Preko phpMyAdmin-a
1. Lokalno → Export → SQL
2. Server → Import

### Preko CLI
```bash
mysqldump -u root -p frizerski_salon > db-backup.sql
scp db-backup.sql root@213.199.32.240:/root/
ssh root@213.199.32.240 "mysql -u root -p frizerski_salon < /root/db-backup.sql"
```
