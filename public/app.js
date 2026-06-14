document.addEventListener('DOMContentLoaded', function() {
  const patientForm = document.getElementById('patient-form');
  const doctorList = document.getElementById('doctors-list');
  const timeSlots = document.getElementById('time-slots');
  const appointmentDetails = document.getElementById('appointment-details');
  const allAppointments = document.getElementById('all-appointments');
  const appointmentsList = document.getElementById('appointments-list');
  const confirmBtn = document.getElementById('confirm-btn');
  const timeConfirmBtn = document.getElementById('time-confirm-btn');
  const loadBtn = document.getElementById('load-appointments');
  const refreshBtn = document.getElementById('load-all');

  // Set minimum date to today
  const dateInput = document.getElementById('appointment-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  // Reload availability when date changes
  dateInput.addEventListener('change', function() {
    if (currentDoctorId) {
      loadAvailability();
    }
  });

  let currentDoctorId = null;
  let selectedSlot = null;

  // Load doctors
  async function loadDoctors() {
    try {
      const response = await fetch('/api/doctors');
      const doctors = await response.json();

      doctors.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        const timingFrom = doctor.available_from.substring(0, 5);
        const timingTo = doctor.available_to.substring(0, 5);
        card.innerHTML = `
          <div class="doctor-name">${doctor.name}</div>
          <div class="doctor-specialty">${doctor.specialty}</div>
          <div class="doctor-timings">⏰ Available: ${timingFrom} - ${timingTo}</div>
        `;
        card.addEventListener('click', () => {
          currentDoctorId = doctor.id;
          // Store current doctor data for later use
          localStorage.setItem('currentDoctorName', doctor.name);
          localStorage.setItem('currentDoctorSpecialty', doctor.specialty);
          localStorage.setItem('doctorFrom', timingFrom);
          localStorage.setItem('doctorTo', timingTo);
          // Show time selection section
          document.querySelector('#time-section').classList.remove('hidden');
          loadAvailability();
        });
        doctorList.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading doctors:', error);
      doctorList.innerHTML = '<p style="color: red;">Error loading doctors</p>';
    }
  }

  // Load available time slots
  async function loadAvailability() {
    if (!currentDoctorId) return;

    const dateInput = document.getElementById('appointment-date');
    const date = dateInput ? dateInput.value || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/availability/${currentDoctorId}/${date}`);
      const data = await response.json();

      // Clear previous slots
      timeSlots.innerHTML = '';

      // Display doctor info with timings
      const doctorName = localStorage.getItem('currentDoctorName');
      const specialty = localStorage.getItem('currentDoctorSpecialty');
      const fromTime = localStorage.getItem('doctorFrom');
      const toTime = localStorage.getItem('doctorTo');
      
      const info = document.getElementById('doctor-info');
      info.innerHTML = `
        <div class="doctor-header">
          <h3>${doctorName}</h3>
          <p class="specialty-tag">${specialty}</p>
        </div>
        <div class="timing-info">
          <strong>Working Hours:</strong> ${fromTime} - ${toTime}
        </div>
        <div class="selected-date-info">
          <strong>Selected Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      `;

      // Display available slots
      timeSlots.classList.remove('hidden');  // Make sure time slots section is visible
      
      if (data.slots.length === 0) {
        timeSlots.innerHTML = '<p class="no-slots">No available slots for this date. Please try another date.</p>';
      } else {
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'slots-grid';
        
        data.slots.forEach(slot => {
          const span = document.createElement('div');
          span.className = 'slot';
          span.textContent = slot;
          span.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
            // Add selection to clicked slot
            selectedSlot = slot;
            span.classList.add('selected');
          });
          slotsContainer.appendChild(span);
        });
        
        timeSlots.appendChild(slotsContainer);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      const info = document.getElementById('doctor-info');
      info.innerHTML = '<p style="color: red;">Error loading availability</p>';
    }
  }

  // Handle patient form submission
  patientForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Grab values directly by ID because the inputs don't have name attributes
    const patientName = document.getElementById('patient-name').value.trim();
    const patientEmail = document.getElementById('patient-email').value.trim();
    const patientPhone = document.getElementById('patient-phone').value.trim();

    if (!patientName || !patientEmail) {
      alert('Please enter name and email');
      return;
    }

    try {
      // Create or get patient
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: patientName,
          email: patientEmail,
          phone: patientPhone || null
        })
      });

      const result = await response.json();

      if (result.id) {
        // Store patient ID for appointment
        localStorage.setItem('patientId', result.id);

        // Show doctor selection (reveal the doctor section, hide patient section)
        document.querySelector('#doctor-section').classList.remove('hidden');
        document.querySelector('#patient-section').classList.add('hidden');
      } else {
        alert('Failed to create patient account');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('An error occurred. Please try again.');
    }
  });

  // Handle time slot confirmation (move to booking confirmation)
  timeConfirmBtn.addEventListener('click', async function() {
    if (!localStorage.getItem('patientId') || !currentDoctorId || !selectedSlot) {
      alert('Please select a doctor and time slot');
      return;
    }

    try {
      const patientId = parseInt(localStorage.getItem('patientId'));
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          patientId: patientId,
          doctorId: currentDoctorId,
          appointmentDate: document.getElementById('appointment-date').value,
          appointmentTime: selectedSlot
        })
      });

      const appointment = await response.json();

      if (appointment.error) {
        alert('Error: ' + appointment.error);
        return;
      }

      // Show confirmation
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      appointmentDetails.innerHTML = `
        <div class="confirmation-details">
          <div class="detail-row">
            <span class="label">Patient:</span>
            <span class="value">${appointment.patient_name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Doctor:</span>
            <span class="value">${appointment.doctor_name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Specialty:</span>
            <span class="value">${appointment.specialty}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span class="value">${appointmentDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Time:</span>
            <span class="value timing-highlight">${appointment.appointment_time}</span>
          </div>
        </div>
      `;

      // Hide current sections and show confirmation
      document.querySelector('#doctor-section').classList.add('hidden');
      document.querySelector('#time-section').classList.add('hidden');
      document.querySelector('#confirmation-section').classList.remove('hidden');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking your appointment');
    }
  });

  // Handle confirm booking button
  confirmBtn.addEventListener('click', function() {
    // Reset the form for a new booking
    localStorage.clear();
    
    // Hide confirmation section and show patient section
    document.querySelector('#confirmation-section').classList.add('hidden');
    document.querySelector('#patient-section').classList.remove('hidden');
    
    // Clear all input fields
    document.getElementById('patient-name').value = '';
    document.getElementById('patient-email').value = '';
    document.getElementById('patient-phone').value = '';
    
    // Show success message
    alert('Appointment confirmed! You will receive a confirmation email shortly.');
  });

  // Load patient's appointments
  loadBtn.addEventListener('click', async function() {
    const email = document.getElementById('appointments-email').value.trim();
    if (!email) {
      alert('Please enter email');
      return;
    }

    try {
      const response = await fetch(`/api/appointments?email=${encodeURIComponent(email)}`);
      const appointments = await response.json();

      appointmentsList.innerHTML = '';

      if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found</p>';
        return;
      }

      appointments.forEach(appoint => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${appoint.patient_name}</strong> with ${appoint.doctor_name} on ${appoint.appointment_date} at ${appoint.appointment_time} (${appoint.specialty})`;
        appointmentsList.appendChild(div);
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('An error occurred while loading your appointments');
    }
  });

  // Refresh all appointments
  refreshBtn.addEventListener('click', async function() {
    try {
      const response = await fetch('/api/admin/appointments');
      const appointments = await response.json();

      // Build the table HTML
      let tableHTML = '<table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>';
      
      if (appointments.length === 0) {
        tableHTML += '<tr><td colspan="5" style="text-align: center; padding: 20px;">No appointments found</td></tr>';
      } else {
        appointments.forEach(appoint => {
          tableHTML += `<tr>
            <td>${appoint.patient_name}</td>
            <td>${appoint.doctor_name} (${appoint.specialty})</td>
            <td>${appoint.appointment_date}</td>
            <td>${appoint.appointment_time}</td>
            <td>${appoint.status}</td>
          </tr>`;
        });
      }
      
      tableHTML += '</tbody></table>';
      allAppointments.innerHTML = tableHTML;
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      allAppointments.innerHTML = '<p style="color: red;">Error loading appointments. Check console for details.</p>';
    }
  });

  // Initial load
  loadDoctors();
});