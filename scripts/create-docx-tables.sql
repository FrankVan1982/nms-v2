-- ============================================================
-- Migration: Tabelle per Fatture, DDT e Impostazioni Aziendali
-- Eseguire manualmente sul database PostgreSQL
-- ============================================================

-- 1. Tabella impostazioni aziendali (dati mittente)
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  legal_address TEXT,
  office_address TEXT,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  email VARCHAR(255),
  pec VARCHAR(255),
  cciaa_registration VARCHAR(100),
  vat_number VARCHAR(50),
  fiscal_code VARCHAR(50),
  iban VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabella fatture
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_description TEXT,
  client_unique_code VARCHAR(50),
  ref_bolla_number VARCHAR(50),
  ref_bolla_date DATE,
  total_merce DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  spese_incasso DECIMAL(12,2) DEFAULT 0,
  total_imponibile DECIMAL(12,2) DEFAULT 0,
  total_imposta DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  scadenziario TEXT,
  acconto DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabella righe fattura
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2),
  description TEXT,
  iva_percent DECIMAL(5,2),
  importo DECIMAL(12,2),
  sort_order INTEGER DEFAULT 0
);

-- 4. Tabella DDT (Documenti di Trasporto)
CREATE TABLE IF NOT EXISTS ddts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ddt_number VARCHAR(50) NOT NULL UNIQUE,
  ddt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_fiscal_code VARCHAR(50),
  payment_conditions TEXT,
  aspetto_beni TEXT,
  n_colli INTEGER,
  peso_lordo DECIMAL(10,2),
  peso_netto DECIMAL(10,2),
  porto VARCHAR(100),
  causale_trasporto TEXT,
  mezzo_trasporto VARCHAR(100),
  data_ora_trasporto TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabella righe DDT
CREATE TABLE IF NOT EXISTS ddt_items (
  id SERIAL PRIMARY KEY,
  ddt_id INTEGER NOT NULL REFERENCES ddts(id) ON DELETE CASCADE,
  codice_articolo VARCHAR(50),
  description TEXT,
  um VARCHAR(20),
  quantity DECIMAL(10,2),
  prezzo DECIMAL(12,2),
  sconto_percent DECIMAL(5,2),
  importo DECIMAL(12,2),
  sort_order INTEGER DEFAULT 0
);

-- 6. Sequenze per numerazione progressiva
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS ddt_number_seq START 1;

-- 7. Indici per performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ddts_client_id ON ddts(client_id);
CREATE INDEX IF NOT EXISTS idx_ddts_ddt_date ON ddts(ddt_date);
CREATE INDEX IF NOT EXISTS idx_ddt_items_ddt_id ON ddt_items(ddt_id);
