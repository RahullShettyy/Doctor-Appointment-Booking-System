# Appointment Booking System

A simple web-based appointment booking application for patients to schedule appointments with doctors. Built with:
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js/Express
- Database: MySQL

## Features
1. **Patient Registration**
   - Create patient account with name, email, and optional phone number
2. **Doctor Selection**
   - Browse available doctors with specialties
3. **Time Slot Booking**
   - View real-time available slots for selected doctor
4. **Appointment Confirmation**
   - Book appointments with instant confirmation
5. **My Appointments**
   - View personal appointment history
6. **Admin View**
   - Real-time dashboard showing all appointments

## Installation & Setup
1. **Prerequisites**
   - Node.js installed
   - MySQL database server installed
2. **Database Setup**
   - Import schema.sql to create tables:
     `mysql -u root -p < schema.sql`
3. **Environment Configuration**
   - Copy .env file and update credentials:
     - DB_USER: MySQL username
     - DB_PASSWORD: MySQL password
     - DB_HOST: Database server address
4. **Start Application**
   - Run `npm install` to install dependencies
   - Start server with `npm start`
5. **Access Application**
   - Visit http://localhost:3000 in your browser

## Usage
1. Register as Patient
   - Enter name and email in the patient form
2. Select Doctor
   - Click on doctor card to view available slots
3. Choose Time Slot
   - Select available time from time slots panel
4. Confirm Appointment
   - Click confirm button to book slot
5. View Appointments
   - Enter your email to see personal appointments
6. Admin Dashboard
   - Refresh button shows all current appointments in table format

## Technical Details
- Real-time database updates: Appointments table updates automatically when bookings are made
- Security: Basic input validation only (for MVP purpose)
- Scalability: Can be extended with authentication, scheduling optimization

## Database Tables
```
-- Doctors
CREATE TABLE doctors (
    id INT...
);

-- Patients
CREATE TABLE patients (
    id INT...
);

-- Appointments
CREATE TABLE appointments (
    id INT...
);
```

## Example Workflow
1. A patient registers with email 'john@example.com'
2. Sees list of doctors (Cardiologist, Dermatologist, etc.)
3. Clicks on 'Dr. Smith' to see available slots
4. Selects '10:00 AM' on June 10th
5. Appointment table updates with new record
6. Patient sees confirmation on screen and in their appointments list

## Notes
- This is a basic implementation for demonstration purposes
- No user authentication is implemented in this version
- All data is stored in a single MySQL database
- Real-time updates are achieved through server-side polling in admin view