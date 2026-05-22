# TODO - Pregled i popravka bagova

## Pronađeni problemi:

### 1. ⚠️ Duplirana MySQL konekcija

- `backend/server.js` kreira sopstvenu MySQL konekciju umesto da koristi `backend/db.js`
- Server.js linije 14-28 su duplikat db.js

### 2. ⚠️ BookingForm.jsx - hardkodovan API URL

- Linija 128: `fetch(/api/appointments/date/${values.date})` - ne koristi requestInstance
- Treba koristiti appointmentService.getByDate() umesto direktnog fetch-a

### 3. ⚠️ MyProfile.jsx - isti problem sa fetch

- Linija 79: `fetch(/api/appointments/date/${editForm.date})` - ne koristi requestInstance

### 4. ⚠️ schema.sql nema icon kolonu

- Tabela services u schema.sql nema `icon` kolonu (dodata je u init-db.js ali ne i u schema.sql)

### 5. ⚠️ AppointmentList.jsx - duplirana funkcionalnost

- Postoji i MyProfile.jsx i AppointmentList.jsx koji rade istu stvar
- AppointmentList se nigde ne koristi u App.jsx

### 6. ⚠️ emailService.js - msmtp zavisnost

- Koristi msmtp koji možda nije instaliran na Windows-u
- Slanje mejlova će verovatno padati

### 7. ⚠️ init-db.js - charset nije utf8mb4

- Treba proveriti da li init-db.js koristi utf8mb4 charset

## Plan popravke:

- [ ] Popraviti dupliranu MySQL konekciju u server.js
- [ ] Zameniti direktne fetch pozive sa appointmentService u BookingForm.jsx
- [ ] Zameniti direktne fetch pozive sa appointmentService u MyProfile.jsx
- [ ] Ažurirati schema.sql sa icon kolonom
- [ ] Proveriti i popraviti init-db.js charset
- [ ] Testirati API
