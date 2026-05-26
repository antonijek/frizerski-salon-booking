# TODO - Ispravka termina

## Bug 1: Admin izmena - provera radnog vremena ne uzima u obzir trajanje usluge

- [ ] U `useAdminAppointments.js` - filterSlotsByBarber treba da uzme u obzir trajanje usluge
- [ ] U `backend/routes/appointments.js` - provera radnog vremena treba da uzme u obzir da se edituje ISTI termin (preskoči ga)

## Bug 2: Booking - zauzeti termini kad nije izabran frizer

- [ ] U `useBookingForm.js` - kada nije izabran frizer, prikazati samo termine kad su SVI frizeri zauzeti

## Bug 3: Admin - dupla provera preklapanja

- [ ] U `useAdminAppointments.js` - ukloniti lokalnu proveru preklapanja, prepustiti serveru

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

**⚠️ VAŽNO:** Ovo će **zameniti** sve podatke na serveru podacima iz lokalne baze. Ako ima appointmenta na serveru koji nisu lokalno, biće izgubljeni.
