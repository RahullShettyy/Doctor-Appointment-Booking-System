# Doctor-Appointment-Booking-System
=======

# Appointment Booking System

A simple web-based appointment booking application for patients to schedule appointments with doctors. This system uses a MySQL database to store and manage appointment data in real-time.

## Tech Stack
- **Frontend**: HTML/CSS/JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Database**: MySQL

## Project Structure
```
mini-project-dbms/
├── package.json         # Node.js dependencies
├── schema.sql          # Database schema and sample data
├── db.js               # MySQL connection pool
├── server.js           # Express server with API endpoints
├── .env               # Environment variables (configure this)
└── public/
    ├── index.html     # Main booking UI
    ├── style.css      # Minimal styling
    └── app.js         # Frontend JavaScript logic
```

## Features

### For Patients
- Register/login with name and email
- Browse available doctors with specialties
- Select from real-time available time slots
- Book appointments instantly
- View personal appointment history

### For Admin/Demo
- Real-time view of all appointments in table format
- Database updates shown immediately after booking

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=appointment_db
PORT=3000
```

### 3. Create Database Tables
Run the schema.sql file in MySQL:
```bash
mysql -u root -p < schema.sql
```

Or manually execute the SQL in your MySQL client.

### 4. Start the Server
```bash
npm start
```

### 5. Access the Application
Open your browser and go to:
```
http://localhost:3000
```

## How to Use

### Patient Booking Flow
1. **Enter Patient Details**
   - Fill in your name and email
   - Click "Continue" to proceed

2. **Select a Doctor**
   - Click on any doctor card to select them
   - Available specialties are shown on each card

3. **Choose Time Slot**
   - Select an available time slot
   - Selected slot will be highlighted in blue

4. **Confirm Appointment**
   - Click "Confirm Booking" button
   - See your appointment details displayed

### Viewing Appointments
- **My Appointments**: Enter your email to see your booked appointments
- **Database View**: Click "Refresh" to see all appointments in real-time table format

## Database Schema

### doctors table
- id (Primary Key)
- name
- specialty
- available_from / available_to (working hours)

### patients table
- id (Primary Key)
- name
- email (unique)
- phone (optional)

### appointments table
- id (Primary Key)
- patient_id (Foreign Key)
- doctor_id (Foreign Key)
- appointment_date
- appointment_time
- status (pending/confirmed/cancelled)
- created_at (timestamp)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors` | GET | Get all doctors |
| `/api/availability/:doctorId/:date` | GET | Get available slots for a doctor |
| `/api/patients` | POST | Create patient record |
| `/api/appointments` | POST | Book an appointment |
| `/api/appointments/:patientId` | GET | Get patient's appointments |
| `/api/admin/appointments` | GET | Get all appointments (admin) |

## Sample Data Included

The schema includes 5 sample doctors and 3 sample patients for testing:
- Dr. Smith - Cardiologist
- Dr. Johnson - Dermatologist
- Dr. Williams - Pediatrician
- Dr. Brown - Orthopedic
- Dr. Davis - Neurologist

## Real-Time Database Updates

When you book an appointment:
1. The JavaScript sends booking data to `/api/appointments`
2. The server inserts record into MySQL appointments table
3. The admin view shows the update immediately when you click "Refresh"
4. The appointment appears in the MySQL table with all details

## Notes
- Time slots are in 30-minute intervals
- Each doctor has default working hours (9 AM - 5 PM)
- Slots cannot be double-booked (unique constraint)
<<<<<<< HEAD
- Cancelled appointments keep their records but change status
=======
- Cancelled appointments keep their records but change status
>>>>>>> abcbaf0 (initial project upload)

>>>>>>> 7b0a94fa2143fe3786bf582d75099ceb8763eeab
