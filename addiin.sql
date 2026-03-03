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
delete from users where id =5;

delete from verifications where id =5;




SHOW TABLES;

-- MySQL Workbench এ run করুন
USE addiin;
