# TODO - Više frizera u salonu

## Plan implementacije:

### 1. Baza podataka

- [x] Dodati tabelu `barbers` u schema.sql
- [x] Dodati `barber_id` u appointments tabelu
- [x] Ažurirati init-db.js

### 2. Backend

- [x] Napraviti rutu `backend/routes/barbers.js`
- [x] Izmeniti appointments.js da podržava barber_id
- [x] Dodati rutu u server.js

### 3. Frontend - Servisi

- [x] Napraviti `frontend/src/services/barberService.js`

### 4. Frontend - BookingForm

- [x] Dodati izbor frizera (opciono)

### 5. Frontend - AdminPanel

- [x] Dodati tab "Frizeri" sa CRUD
- [x] Prikazati frizera u listi termina
- [x] Filter termina po frizeru
- [x] Dodati tab "Usluge" sa CRUD
- [x] Dodati tab "Korisnici" sa listom i upravljanjem
- [x] Dodati tab "Statistika" sa karticama i grafikonima

### 6. Frontend - MyProfile

- [x] Prikazati frizera u terminima

### 7. Deploy

- [ ] Push na GitHub
- [ ] Pull na server
- [ ] Rebuild frontend
- [ ] Pokrenuti init-db.js na serveru

---

## 📋 Pregled kompletnog projekta

### Backend (Node.js + Express + MySQL)

- **server.js** - Glavni server fajl, rute, middleware
- **db.js** - MySQL konekcija
- **init-db.js** - Inicijalizacija baze (tabele, seed podaci)
- **emailService.js** - Slanje email notifikacija (msmtp)
- **middleware/auth.js** - JWT autentifikacija
- **routes/auth.js** - Login/registracija
- **routes/appointments.js** - CRUD termina
- **routes/services.js** - CRUD usluga
- **routes/barbers.js** - CRUD frizera

### Frontend (React + Vite + Tailwind CSS)

- **HomePage** - Početna stranica sa uslugama i frizerima
- **BookingForm** - Zakazivanje termina (izbor usluge, frizera, datuma, vremena)
- **ServicesPage** - Pregled svih usluga
- **AppointmentList** - Lista termina korisnika
- **MyProfile** - Profil korisnika sa terminima
- **AdminPanel** - Admin panel sa 5 tabova:
    - 📅 Termini (pregled, filteri, izmena, brisanje)
    - ✂️ Usluge (CRUD)
    - 🧔 Frizeri (CRUD, aktivacija/deaktivacija)
    - 👥 Korisnici (pregled, uloge, brisanje)
    - 📊 Statistika (ukupno, danas, predstojeći, po uslugama/frizerima)
- **ServiceCard** - Komponenta za prikaz usluge
- **PageWrapper** - Wrapper komponenta sa navigacijom

### Šta je ostalo / moguća poboljšanja:

1. **Deploy** na server (push na GitHub → pull na server → rebuild)
2. **Email notifikacije** - srediti msmtp konfiguraciju
3. **Radno vrijeme frizera** - podešavanje po danima (već postoji u bazi)
4. **Online plaćanje** - integracija payment gateway-a
5. **Notifikacije u realnom vremenu** - WebSocket/Socket.IO
6. **Mobilna aplikacija** - React Native
7. **Recenzije i ocjene** za frizere/usluge
8. **Multi-language** podrška
