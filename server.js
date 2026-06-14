const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Get all doctors with their timings
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, specialty, available_from, available_to FROM doctors ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available time slots for a doctor on a specific date
app.get('/api/availability/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Get doctor's working hours
    const [doctor] = await pool.query(
      'SELECT available_from, available_to FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (doctor.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const { available_from, available_to } = doctor[0];

    // Get booked slots for that date
    const [booked] = await pool.query(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != "cancelled"',
      [doctorId, date]
    );

    const bookedTimes = booked.map(b => b.appointment_time);

    // Generate available time slots (30 min intervals)
    const slots = [];
    const start = new Date(`2000-01-01T${available_from}`);
    const end = new Date(`2000-01-01T${available_to}`);

    while (start < end) {
      const timeStr = start.toTimeString().slice(0, 5);
      if (!bookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
      start.setMinutes(start.getMinutes() + 30);
    }

    res.json({ slots, doctorHours: { from: available_from, to: available_to } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new patient (or get existing by email)
app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if patient exists
    const [existing] = await pool.query('SELECT id FROM patients WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.json({ id: existing[0].id, message: 'Patient already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book an appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if slot is available
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }

    // Insert appointment
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, appointmentDate, appointmentTime]
    );

    // Return the new appointment with details
    const [appointment] = await pool.query(`
      SELECT a.*, d.name as doctor_name, d.specialty, p.name as patient_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json(appointment[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient's appointments by patient ID
app.get('/api/appointments/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const [rows] = await pool.query(`
      SELECT a.*, d.name as doctor_name, d.specialty
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date, a.appointment_time
    `, [patientId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments by patient email (used by the UI)
app.get('/api/appointments', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter required' });
    }
    // Find patient by email
    const [patientRows] = await pool.query('SELECT id FROM patients WHERE email = ?', [email]);
    if (patientRows.length === 0) {
      return res.json([]);
    }
    const patientId = patientRows[0].id;
    const [rows] = await pool.query(`
      SELECT a.*, d.name as doctor_name, d.specialty
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date, a.appointment_time
    `, [patientId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE appointments SET status = "cancelled" WHERE id = ?', [id]);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments (for demo - shows table updates)
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, d.name as doctor_name, d.specialty, p.name as patient_name, p.email
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});