Ant260142kne-- Kreiranje baze podataka
CREATE DATABASE IF NOT EXISTS frizerski_salon;
USE frizerski_salon;

-- Tabela za frizere
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    title VARCHAR(100),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    work_days VARCHAR(20) DEFAULT '1,2,3,4,5,6',
    work_start TIME DEFAULT '09:00:00',
    work_end TIME DEFAULT '17:00:00',
    salon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci osnovne frizere
INSERT INTO barbers (name, image_url, title, bio) VALUES
('Marija Petrović', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop', 'Senior frizer', 'Sa preko 10 godina iskustva, specijalizovana za moderne tehnike šišanja i farbanja.'),
('Jovan Jovanović', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', 'Barber', 'Stručnjak za muške frizure i brijanje, sa više od 8 godina iskustva.'),
('Ana Nikolić', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop', 'Kolorista', 'Specijalista za bojenje kose i balayage tehnike. Stalno prati najnovije trendove.');


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
    salon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_appointment (date, time, barber_id),
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- Tabela za korisnike
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    salon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- Tabela za usluge
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration INT NOT NULL COMMENT 'Trajanje u minutama',
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '✂️',
    salon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
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
    salon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci pocetne slike iz salonConfig
INSERT INTO gallery_images (src, alt, sort_order, salon_id) VALUES
('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', 'Frizura 1', 1, 1),
('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', 'Frizura 2', 2, 1),
('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop', 'Frizura 3', 3, 1),
('https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop', 'Frizura 4', 4, 1),
('https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop', 'Frizura 5', 5, 1),
('https://images.unsplash.com/photo-1634302086195-76c43c3e2e4f?w=600&h=600&fit=crop', 'Frizura 6', 6, 1);

-- ============================================
-- Tabela za salone (multi-tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS salons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    tagline VARCHAR(300),
    description TEXT,
    logo_url VARCHAR(500),
    hero_image_url VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(200),
    address VARCHAR(300),
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    working_hours_interval INT DEFAULT 30,
    working_days VARCHAR(50) DEFAULT '1,2,3,4,5,6',
    
    -- Boje (hex vrednosti)
    primary_color VARCHAR(7) DEFAULT '#d97706',
    primary_hover VARCHAR(7) DEFAULT '#b45309',
    primary_light VARCHAR(7) DEFAULT '#fffbeb',
    primary_bg_from VARCHAR(7) DEFAULT '#fef3c7',
    primary_bg_to VARCHAR(7) DEFAULT '#ffedd5',
    neutral_bg VARCHAR(7) DEFAULT '#f9fafb',
    text_primary VARCHAR(7) DEFAULT '#1f2937',
    text_secondary VARCHAR(7) DEFAULT '#6b7280',
    
    -- Fontovi
    heading_font VARCHAR(100) DEFAULT 'Inter',
    body_font VARCHAR(100) DEFAULT 'Inter',
    
    -- Podesavanja
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ubaci podrazumevani salon
INSERT INTO salons (subdomain, name, short_name, tagline, description, phone, email, address) VALUES
('main', 'Frizerski Salon', 'Salon', 'Profesionalna nega vaše kose', 'Dobrodošli u naš salon gde vaša kosa dobija najbolju negu.', '+381 61 234 567', 'info@salon.rs', 'Ulica bb, Grad');
