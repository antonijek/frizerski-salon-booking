# Refactoring - TODO

## Faza 1: Admin Panel ✅

- [x] LoadingSpinner.jsx - spinner za ucitavanje
- [x] EmptyState.jsx - prazan state sa ikonicom i porukom
- [x] ConfirmDialog.jsx - dijalog za potvrdu brisanja
- [x] AdminFilters.jsx - filteri za termine (datum, frizer, tip)
- [x] AdminModal.jsx - reusable modal za forme
- [x] NotificationBanner.jsx - error/success poruke
- [x] useAdminAppointments.js - logika za termine
- [x] useAdminServices.js - logika za usluge
- [x] useAdminBarbers.js - logika za frizere
- [x] useAdminUsers.js - logika za korisnike
- [x] AppointmentsTab.jsx - refaktorisan
- [x] ServicesTab.jsx - refaktorisan
- [x] BarbersTab.jsx - refaktorisan
- [x] UsersTab.jsx - refaktorisan
- [x] StatsTab.jsx - refaktorisan

## Faza 2: Booking Form ✅

- [x] useBookingForm.js - hook za formu zakazivanja
- [x] FormField.jsx - reusable input polje
- [x] TimeSlotPicker.jsx - grid za izbor vremena
- [x] SuccessPrompt.jsx - poruka posle zakazivanja
- [x] BookingForm.jsx - refaktorisan (koristi hook + komponente)

## Faza 3: My Profile ✅

- [x] useMyProfile.js - hook za profil korisnika
- [x] AppointmentCard.jsx - kartica za prikaz termina
- [x] EditAppointmentModal.jsx - modal za izmenu termina
- [x] MyProfile.jsx - refaktorisan (koristi hook + komponente)
- [x] ConfirmDialog dodat u MyProfile (zamenjen confirm())

## Faza 4: Čišćenje ✅

- [x] LoadingSpinner premešten u common/ (umesto dupliranja u admin/)
- [x] ConfirmDialog iz admin/ obrisan (koristi se common/ConfirmDialog)
- [x] AppointmentList.jsx obrisan (stara komponenta)
- [x] LoadingSpinner korišćen u MyProfile.jsx i ServicesPage.jsx

## Struktura projekta

```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── AdminFilters.jsx
│   │   ├── AdminModal.jsx
│   │   ├── AppointmentsTab.jsx
│   │   ├── BarbersTab.jsx
│   │   ├── EmptyState.jsx
│   │   ├── NotificationBanner.jsx
│   │   ├── ServicesTab.jsx
│   │   ├── StatsTab.jsx
│   │   └── UsersTab.jsx
│   ├── common/
│   │   ├── AppointmentCard.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EditAppointmentModal.jsx
│   │   ├── FormField.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PageWrapper.jsx
│   │   ├── ServiceCard.jsx
│   │   ├── SuccessPrompt.jsx
│   │   └── TimeSlotPicker.jsx
│   ├── AdminPanel.jsx
│   ├── BookingForm.jsx
│   ├── HomePage.jsx
│   ├── MyProfile.jsx
│   └── ServicesPage.jsx
├── hooks/
│   ├── useAdminAppointments.js
│   ├── useAdminBarbers.js
│   ├── useAdminServices.js
│   ├── useAdminUsers.js
│   ├── useAppointments.js
│   ├── useBookingForm.js
│   ├── useForm.js
│   └── useMyProfile.js
└── services/
    ├── appointmentService.js
    ├── authService.js
    ├── barberService.js
    ├── requestInstance.js
    └── serviceService.js
```
