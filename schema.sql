-- Database schema for appointment booking system

CREATE DATABASE IF NOT EXISTS appointment_db;
USE appointment_db;

-- Doctors table
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    available_from TIME NOT NULL DEFAULT '09:00:00',
    available_to TIME NOT NULL DEFAULT '17:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    UNIQUE KEY unique_appointment (doctor_id, appointment_date, appointment_time)
);

-- Insert sample doctors
INSERT INTO doctors (name, specialty) VALUES
('Dr. Smith', 'Cardiologist'),
('Dr. Johnson', 'Dermatologist'),
('Dr. Williams', 'Pediatrician'),
('Dr. Brown', 'Orthopedic'),
('Dr. Davis', 'Neurologist');

-- Insert sample patients
INSERT INTO patients (name, email, phone) VALUES
('John Doe', 'john@example.com', '123-456-7890'),
('Jane Smith', 'jane@example.com', '234-567-8901'),
('Bob Johnson', 'bob@example.com', '345-678-9012');