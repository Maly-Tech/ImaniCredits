-- ImaniCredit Loan Application Management System
-- MySQL Database Schema

-- Create users table for admin accounts
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- KYC Verification
  id_type VARCHAR(100),
  id_number VARCHAR(100),
  phone_number VARCHAR(20),
  date_of_birth DATE,
  
  -- Personal Profile
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  marital_status VARCHAR(50),
  street_address VARCHAR(255),
  city VARCHAR(100),
  state_county VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Employment Status
  employment_status VARCHAR(100),
  occupation VARCHAR(255),
  company_name VARCHAR(255),
  industry VARCHAR(100),
  years_in_job INT,
  
  -- Salary & Income
  annual_salary DECIMAL(15, 2),
  income_source VARCHAR(100),
  monthly_expenses DECIMAL(15, 2),
  existing_debt DECIMAL(15, 2),
  bank_account_type VARCHAR(100),
  
  -- Loan Details
  loan_purpose VARCHAR(255),
  loan_amount DECIMAL(15, 2),
  loan_term VARCHAR(50),
  
  -- Application Status
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_comments TEXT,
  approved_by INT,
  approval_date TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_created_at (created_at),
  INDEX idx_application_number (application_number)
);

-- Create application_history table for audit trail
CREATE TABLE IF NOT EXISTS application_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  action VARCHAR(100),
  performed_by INT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_application_id (application_id),
  INDEX idx_created_at (created_at)
);

-- Create admin_logs table for security tracking
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  action VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at)
);

-- Create default admin user (password should be hashed in production)
-- Username: admin@imanicredit.com, Password: Admin@123 (hash this properly)
INSERT IGNORE INTO users (email, password, full_name, role, is_active)
VALUES ('admin@imanicredit.com', '$2b$10$placeholder', 'Admin User', 'admin', TRUE);
