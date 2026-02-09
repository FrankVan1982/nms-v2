-- Create clients table for customer management
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  vat_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for demo purposes
INSERT INTO clients (company_name, contact_name, email, phone, address, city, country, vat_number, notes)
VALUES 
  ('Test', 'Mario Rossi', 'test@example.com', '+39 02 1234567', 'Via Roma 123', 'Milano', 'Italia', 'IT12345678901', 'Cliente principale')
ON CONFLICT DO NOTHING;