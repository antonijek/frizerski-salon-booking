# TODO - Frizerski salon booking

## Trenutno stanje (27.05.2026)

Sve radi. Backend na portu 5000, frontend na 5173.
**Napomena:** `msmtp` email slanje ne radi na Windowsu — treba popraviti.

### ✅ Urađeno u posljednjoj sesiji: Uklonjen `status` u potpunosti

- [x] `backend/routes/appointments.js` — uklonjen `a.status` iz 4 SELECT upita, `status, 'confirmed'` iz INSERT-a, `status = ?` iz UPDATE-a, cijeli `PATCH /:id/status` route
- [x] `frontend/src/components/admin/AppointmentsTab.jsx` — uklonjen `statusConfig`, Status `<th>`, status `<td>` kolona
- [x] `frontend/src/hooks/useAdminAppointments.js` — uklonjena `handleStatusChange`
- [x] `frontend/src/services/appointmentService.js` — uklonjena `updateStatus`
- [x] Baza: `ALTER TABLE appointments DROP COLUMN status;`
- [x] Obrisan `backend/add-appointments-status.js`
- [x] API verifikovan — `GET /api/appointments` vraća podatke bez `status` polja

---

## Završeno ✅

- [x] TESTIRANJE super admin panela (POST/DELETE salons, frontend SaloniTab)
- [x] APPOINTMENTS - Uklonjena `status` kolona (bila pending/confirmed/cancelled/completed)
    - [x] Obrisana migration skripta `backend/add-appointments-status.js`
    - [x] `backend/init-db.js` - uklonjen status iz SQL upita
    - [x] `database/schema.sql` - uklonjen status iz CREATE TABLE
    - [x] `backend/routes/appointments.js` - sve GET rute bez statusa, POST/PUT bez statusa, uklonjena PATCH /:id/status
    - [x] `frontend/src/services/appointmentService.js` - uklonjen `updateStatus()` metod
    - [x] `frontend/src/hooks/useAdminAppointments.js` - uklonjen `handleStatusChange`
    - [x] `frontend/src/components/admin/AppointmentsTab.jsx` - uklonjena Status kolona
    - [x] Baza: `ALTER TABLE appointments DROP COLUMN status`

## Sledeće 🔧

### 1. 🔧 INIT-DB - Dodati `salon_id` u appointments tabelu

- [ ] U `backend/init-db.js` CREATE TABLE appointments nedostaje `salon_id` kolona
- [ ] Proveriti da li `database/schema.sql` takođe fali

### 2. 🔧 GALLERY - Proveriti gallery rute

- [ ] Proveriti da li gallery rute rade ispravno sa salon context middleware-om
- [ ] Testirati upload i GET za galeriju

### 3. 🔧 REGISTRATION - Popraviti registraciju

- [ ] Registracija ne dodeljuje `salon_id` novom korisniku
- [ ] Popraviti `backend/routes/auth.js` da poveže korisnika sa salonom

### 4. 🔧 ERROR HANDLING - Unifikacija

- [ ] Ujednačiti error response format na svim rutama
- [ ] Dodati global error handler middleware

### 5. 🔧 DOCKER - Docker setup

- [ ] Kreirati Dockerfile za backend
- [ ] Kreirati Dockerfile za frontend
- [ ] Kreirati docker-compose.yml

### 6. 🔧 EMAIL - Popraviti msmtp na Windowsu

- [ ] `msmtp` nije Windows komanda — email slanje pada sa "msmtp is not recognized"
- [ ] Ili instalirati msmtp za Windows, ili prebaciti na nodemailer

---

## Deploy procedura (kad god pulluješ kod na server)

Kad sledeći put budemo radili `git pull` na serveru, ovo je kompletna procedura:

```bash
# 1. Uđi na server
ssh root@213.199.32.240

# 2. Pulluj najnoviji kod
cd /var/www/html
git pull

# 3. Instaliraj dependency-je
cd /var/www/html/backend && npm install
cd /var/www/html/frontend && npm install

# 4. Build frontend
cd /var/www/html/frontend && npm run build

# 5. Migracija baze (kreira sve tabele ako ne postoje)
cd /var/www/html/backend
node init-db.js
node create-barbers-table.js
node init-gallery.js

# 6. Restartuj backend
pm2 restart frizerski-salon
```

Ili, ako želiš još jednostavnije - samo pokreneš deploy skriptu koju smo napravili:

```bash
cd /var/www/html && bash deploy.sh
```

---

## Sinhronizacija baze (lokalno → server)

Kad želiš da podaci na serveru budu identični kao lokalni (barberi, usluge, appointmenti, galerija):

### Opcija 1: Preko phpMyAdmin-a (lakše)

1. **Lokalno** - Otvori http://localhost/phpmyadmin, izaberi bazu `frizerski_salon`, klikni **Export** → **SQL** → **Go**. Sačuvaj `.sql` fajl.
2. **Server** - Otvori http://213.199.32.240/phpmyadmin, izaberi bazu `frizerski_salon`, klikni **Import**, izaberi taj `.sql` fajl, klikni **Go**.

### Opcija 2: Preko komandne linije (brže)

```bash
# 1. Lokalno - napravi dump baze
mysqldump -u root -p frizerski_salon > db-backup.sql

# 2. Pošalji na server
scp db-backup.sql root@213.199.32.240:/root/

# 3. Na serveru - importuj
ssh root@213.199.32.240
mysql -u root -p frizerski_salon < /root/db-backup.sql
```
