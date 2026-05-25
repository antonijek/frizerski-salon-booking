-- Kreiranje baze podataka
CREATE DATABASE IF NOT EXISTS frizerski_salon;
USE frizerski_salon;

-- Tabela za frizere
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci osnovne frizere
INSERT INTO barbers (name) VALUES
('Marko'),
('Jovana'),
('Ana');

-- Tabela za termine
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    date DATE NOT NULL,
    time TIME NOT NULL,
    service VARCHAR(100) NOT NULL,
    barber_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_appointment (date, time, barber_id),
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL
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

-- Tabela za galeriju
CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    src VARCHAR(500) NOT NULL,
    alt VARCHAR(200) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci pocetne slike iz salonConfig
INSERT INTO gallery_images (src, alt, sort_order) VALUES
('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', 'Frizura 1', 1),
('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', 'Frizura 2', 2),
('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop', 'Frizura 3', 3),
('https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop', 'Frizura 4', 4),
('https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop', 'Frizura 5', 5),
('https://images.unsplash.com/photo-1634302086195-76c43c3e2e4f?w=600&h=600&fit=crop', 'Frizura 6', 6);
