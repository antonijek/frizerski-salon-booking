# TODO - Ispravka termina

## Bug 1: Admin izmena - provera radnog vremena ne uzima u obzir trajanje usluge

- [ ] U `useAdminAppointments.js` - filterSlotsByBarber treba da uzme u obzir trajanje usluge
- [ ] U `backend/routes/appointments.js` - provera radnog vremena treba da uzme u obzir da se edituje ISTI termin (preskoči ga)

## Bug 2: Booking - zauzeti termini kad nije izabran frizer

- [ ] U `useBookingForm.js` - kada nije izabran frizer, prikazati samo termine kad su SVI frizeri zauzeti

## Bug 3: Admin - dupla provera preklapanja

- [ ] U `useAdminAppointments.js` - ukloniti lokalnu proveru preklapanja, prepustiti serveru
