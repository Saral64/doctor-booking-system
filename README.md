# Doctor Appointment Booking System

A healthcare-focused appointment system with real concurrency protection.

## Live Links
- Frontend: https://doctor-booking-system-git-main-saral-rastogis-projects.vercel.app/
- Backend: https://doctor-booking-backend-2mm3.onrender.com
- Video Demo: https://drive.google.com/drive/folders/1e7vd4mBJGP5Ejng52_V0pn8mR9xatI3W?usp=sharing

## Features
- Admin: Create doctors and time slots
- Users: Browse doctors, view available slots, book appointments
- Concurrency-safe booking using PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) + transactions
- Responsive UI with React + TypeScript + Tailwind CSS

## Tech Stack
- Frontend: React, TypeScript, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL (pg)
- Deployment: Vercel (frontend), Render (backend + free PostgreSQL)

## Concurrency Protection
Booking endpoint uses pessimistic locking:
```sql
BEGIN;
SELECT available_seats FROM slots WHERE id = $1 FOR UPDATE;
-- check seats, update, insert booking
COMMIT;
This guarantees no overbooking even if multiple users try simultaneously.
```

Local Setup

# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev

Thanks for checking out my project!

