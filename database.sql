-- ============================================
-- OFFICE TASK MANAGEMENT APP - DATABASE SETUP
-- Run this in pgAdmin Query Tool
-- ============================================

-- Create database (run this separately if needed)
-- CREATE DATABASE office_app;

-- Connect to office_app database first, then run below:

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Employees table (includes admin)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin)
INSERT INTO employees (username, password, full_name, email, role, department)
VALUES ('admin', 'admin', 'Administrator', 'admin@office.com', 'admin', 'Management');

-- Trigger to update updated_at on task update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Verify setup
SELECT 'Database setup complete!' AS message;
SELECT id, username, full_name, role FROM employees;
