-- Kreiranje baze podataka
CREATE DATABASE IF NOT EXISTS frizerski_salon;
USE frizerski_salon;

-- Tabela za termine
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    date DATE NOT NULL,
    time TIME NOT NULL,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_appointment (date, time)
);

-- Tabela za korisnike
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela za usluge
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration INT NOT NULL COMMENT 'Trajanje u minutama',
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- Ubaci osnovne usluge
INSERT INTO services (name, duration, price, description) VALUES
('Šišanje', 30, 15.00, 'Šišanje makazama ili mašinicom'),
('Farbanje', 90, 40.00, 'Farbanje cele kose'),
('Pranje i feniranje', 45, 20.00, 'Pranje i feniranje kose'),
('Šišanje i feniranje', 60, 30.00, 'Šišanje sa feniranjem'),
('Brijački poslovi', 20, 10.00, 'Brijanje brade i glave'),
('Tretman za kosu', 45, 25.00, 'Hranljivi tretman za kosu');
