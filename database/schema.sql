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
    description TEXT,
    icon VARCHAR(10) DEFAULT '✂️',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci osnovne usluge
INSERT INTO services (name, duration, price, description, icon) VALUES
('Šišanje', 30, 15.00, 'Šišanje po želji', '✂️'),
('Šišanje i feniranje', 45, 20.00, 'Šišanje sa feniranjem', '💇'),
('Farbanje', 90, 35.00, 'Farbanje cele kose', '🎨'),
('Balayage', 120, 50.00, 'Tehnika balayage', '✨'),
('Pramenovi', 90, 40.00, 'Pramenovi na foliju', '🌟'),
('Feniranje', 30, 12.00, 'Samo feniranje', '💨'),
('Peglanje kose', 30, 10.00, 'Peglanje kose', '🔧'),
('Šišanje brade', 20, 8.00, 'Sređivanje brade', '🧔');
