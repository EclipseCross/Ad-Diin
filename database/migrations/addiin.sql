CREATE TABLE prayer_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prayer_name VARCHAR(50) NOT NULL,     -- 'fajr_azan', 'fajr_jamaat', 'tahajjut', etc
    prayer_time TIME NOT NULL,
    display_name_en VARCHAR(50) NOT NULL,
    display_name_bn VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,        -- 'fard', 'nafl', 'wajib', 'sunnah'
    prayer_type VARCHAR(20) NOT NULL,      -- 'azan', 'jamaat', 'optional'
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
DROP TABLE IF EXISTS prayer_times;
-- Insert data
INSERT INTO prayer_times (prayer_name, prayer_time, display_name_en, display_name_bn, category, prayer_type, display_order) VALUES
-- Fard prayers - Azan
('fajr_azan', '05:00:00', 'Fajr Azan', 'ফজর আযান', 'fard', 'azan', 1),
('dhuhr_azan', '12:15:00', 'Dhuhr Azan', 'যোহর আযান', 'fard', 'azan', 3),
('asr_azan', '15:45:00', 'Asr Azan', 'আসর আযান', 'fard', 'azan', 5),
('maghrib_azan', '18:30:00', 'Maghrib Azan', 'মাগরিব আযান', 'fard', 'azan', 7),
('isha_azan', '20:00:00', 'Isha Azan', 'ইশা আযান', 'fard', 'azan', 9),

-- Fard prayers - Jamaat
('fajr_jamaat', '05:30:00', 'Fajr Jamaat', 'ফজর জামাত', 'fard', 'jamaat', 2),
('dhuhr_jamaat', '12:30:00', 'Dhuhr Jamaat', 'যোহর জামাত', 'fard', 'jamaat', 4),
('asr_jamaat', '16:00:00', 'Asr Jamaat', 'আসর জামাত', 'fard', 'jamaat', 6),
('maghrib_jamaat', '18:35:00', 'Maghrib Jamaat', 'মাগরিব জামাত', 'fard', 'jamaat', 8),
('isha_jamaat', '20:15:00', 'Isha Jamaat', 'ইশা জামাত', 'fard', 'jamaat', 10),

-- Nafl prayers
('tahajjut', '02:30:00', 'Tahajjut', 'তাহাজ্জুদ', 'nafl', 'optional', 11),
('ishraq', '05:45:00', 'Ishraq', 'ইশরাক', 'nafl', 'optional', 12),
('duha', '08:00:00', 'Duha', 'দুহা', 'nafl', 'optional', 13),
('awwabin', '18:45:00', 'Awwabin', 'আওয়াবীন', 'nafl', 'optional', 14);


-- ============================================
-- Table 2: users (for authentication)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Insert test users (password: 123456)
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Test User', 'test@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Admin User', 'admin@addiin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW());

-- ============================================
-- Table 3: password_reset_tokens (for forgot password)
-- ============================================
CREATE TABLE password_reset_tokens (
    email VARCHAR(100) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

-- Add these columns to users table
ALTER TABLE users 
ADD COLUMN address VARCHAR(255) NULL AFTER phone,
ADD COLUMN city VARCHAR(100) NULL AFTER address,
ADD COLUMN postal_code VARCHAR(20) NULL AFTER city,
ADD COLUMN date_of_birth DATE NULL AFTER postal_code,
ADD COLUMN gender ENUM('male', 'female', 'other') NULL AFTER date_of_birth,
ADD COLUMN profile_picture VARCHAR(255) NULL AFTER gender;

-- ============================================
-- Table 4: verifications (for email verification)
-- ============================================
CREATE TABLE IF NOT EXISTS verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_verifications_email (email)
);

-- Check if email_verified_at already exists in users table
-- If not, add it
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "email_verified_at";
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    "SELECT 1",
    CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TIMESTAMP NULL AFTER remember_token;")
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Table 5: milads (for milad booking)
-- ============================================
CREATE TABLE IF NOT EXISTS milads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    milad_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_remark TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_milads_user_id (user_id),
    INDEX idx_milads_status (status)
);


-- ============================================
-- Check if milads table exists
-- ============================================
USE addiin;

-- Show current structure
DESCRIBE milads;

-- ============================================
-- Add admin_remark column to milads table (if not exists)
-- ============================================
SET @dbname = DATABASE();
SET @tablename = "milads";
SET @columnname = "admin_remark";
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = @columnname) > 0,
    "SELECT 'admin_remark column already exists'",
    CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", 
           @columnname, " TEXT NULL AFTER status;")
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Verify the column was added
-- ============================================
DESCRIBE milads;


-- ============================================
-- Table: islamic_events
-- ============================================
CREATE TABLE islamic_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    hijri_date VARCHAR(100) NOT NULL,
    hijri_month VARCHAR(50) NOT NULL,
    hijri_day INT NOT NULL,
    event_type ENUM('special', 'religious', 'festival', 'historical') DEFAULT 'religious',
    description TEXT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Values (Data)
-- ============================================
INSERT INTO islamic_events (event_name, event_date, hijri_date, hijri_month, hijri_day, event_type, description, display_order) VALUES
('Shab e Meraj 2026', '2026-01-17', '27 Rajab 1447h', 'Rajab', 27, 'religious', 'Night of Ascension', 1),
('Shab e Barat 2026', '2026-02-04', '15 Shaban 1447h', 'Shaban', 15, 'religious', 'Night of Forgiveness', 2),
('Ramadan 2026', '2026-02-19', '1 Ramadan 1447h', 'Ramadan', 1, 'religious', 'First day of Ramadan', 3),
('Laylat al Qadr 2026', '2026-03-17', '27 Ramadan 1447h', 'Ramadan', 27, 'special', 'Night of Power', 4),
('Eid ul Fitr 2026', '2026-03-20', '1 Shawwal 1447h', 'Shawwal', 1, 'festival', 'Festival of Breaking Fast', 5),
('Hajj 2026', '2026-05-24', '7 Dhul Hijjah 1447h', 'Dhul Hijjah', 7, 'religious', 'Day of Arafah', 6),
('Eid al Adha 2026', '2026-05-27', '10 Dhul Hijjah 1447h', 'Dhul Hijjah', 10, 'festival', 'Festival of Sacrifice', 7),
('Muharram 2026', '2026-06-16', '1 Muharram 1448h', 'Muharram', 1, 'religious', 'Islamic New Year', 8),
('Ashura 2026', '2026-06-25', '10 Muharram 1448h', 'Muharram', 10, 'historical', 'Day of Ashura', 9),
('12 Rabi ul Awal 2026', '2026-08-25', '12 Rabi ul Awal 1448h', 'Rabi ul Awal', 12, 'festival', 'Birthday of Prophet Muhammad (PBUH)', 10);








-- Show all tables
SHOW TABLES;

-- Describe milads table
DESCRIBE milads;




-- Show all tables
SHOW TABLES;

-- Show structure of verifications table
DESCRIBE verifications;

-- Show updated users table
DESCRIBE users;




-- Show all data
SELECT * FROM users;
SELECT * FROM verifications;
SELECT * FROM password_reset_tokens;
SELECT * from milads;
delete from users where id =3;

delete from verifications where id =5;




SHOW TABLES;

-- MySQL Workbench এ run করুন
USE addiin;


