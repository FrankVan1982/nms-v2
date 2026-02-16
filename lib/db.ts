import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Client {
  id: number
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  vat_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">

export async function getClients(): Promise<Client[]> {
  const clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`
  return clients as Client[]
}

export async function getClientById(id: number): Promise<Client | null> {
  const clients = await sql`SELECT * FROM clients WHERE id = ${id}`
  return (clients[0] as Client) || null
}

export async function createClient(data: ClientInput): Promise<Client> {
  const result = await sql`
    INSERT INTO clients (company_name, contact_name, email, phone, address, city, country, vat_number, notes)
    VALUES (${data.company_name}, ${data.contact_name}, ${data.email}, ${data.phone}, ${data.address}, ${data.city}, ${data.country}, ${data.vat_number}, ${data.notes})
    RETURNING *
  `
  return result[0] as Client
}

export async function updateClient(id: number, data: ClientInput): Promise<Client | null> {
  const result = await sql`
    UPDATE clients 
    SET 
      company_name = ${data.company_name},
      contact_name = ${data.contact_name},
      email = ${data.email},
      phone = ${data.phone},
      address = ${data.address},
      city = ${data.city},
      country = ${data.country},
      vat_number = ${data.vat_number},
      notes = ${data.notes},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Client) || null
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM clients WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// ============================================================
// Company Settings
// ============================================================

export interface CompanySettings {
  id: number
  company_name: string
  legal_address: string | null
  office_address: string | null
  phone: string | null
  mobile: string | null
  email: string | null
  pec: string | null
  cciaa_registration: string | null
  vat_number: string | null
  fiscal_code: string | null
  iban: string | null
  created_at: string
  updated_at: string
}

export type CompanySettingsInput = Omit<CompanySettings, "id" | "created_at" | "updated_at">

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const rows = await sql`SELECT * FROM company_settings ORDER BY id LIMIT 1`
  return (rows[0] as CompanySettings) || null
}

export async function upsertCompanySettings(data: CompanySettingsInput): Promise<CompanySettings> {
  const existing = await getCompanySettings()
  if (existing) {
    const result = await sql`
      UPDATE company_settings SET
        company_name = ${data.company_name},
        legal_address = ${data.legal_address},
        office_address = ${data.office_address},
        phone = ${data.phone},
        mobile = ${data.mobile},
        email = ${data.email},
        pec = ${data.pec},
        cciaa_registration = ${data.cciaa_registration},
        vat_number = ${data.vat_number},
        fiscal_code = ${data.fiscal_code},
        iban = ${data.iban},
        updated_at = NOW()
      WHERE id = ${existing.id}
      RETURNING *
    `
    return result[0] as CompanySettings
  }
  const result = await sql`
    INSERT INTO company_settings (company_name, legal_address, office_address, phone, mobile, email, pec, cciaa_registration, vat_number, fiscal_code, iban)
    VALUES (${data.company_name}, ${data.legal_address}, ${data.office_address}, ${data.phone}, ${data.mobile}, ${data.email}, ${data.pec}, ${data.cciaa_registration}, ${data.vat_number}, ${data.fiscal_code}, ${data.iban})
    RETURNING *
  `
  return result[0] as CompanySettings
}

// ============================================================
// Invoices (Fatture)
// ============================================================

export interface Invoice {
  id: number
  client_id: number
  invoice_number: string
  invoice_date: string
  payment_description: string | null
  client_unique_code: string | null
  ref_bolla_number: string | null
  ref_bolla_date: string | null
  total_merce: number
  discount_percent: number
  spese_incasso: number
  total_imponibile: number
  total_imposta: number
  total: number
  scadenziario: string | null
  acconto: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceWithClient extends Invoice {
  company_name: string
  contact_name: string
  client_email: string
  client_phone: string | null
  client_address: string | null
  client_city: string | null
  client_vat_number: string | null
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  quantity: number | null
  description: string | null
  iva_percent: number | null
  importo: number | null
  sort_order: number
}

export type InvoiceInput = Omit<Invoice, "id" | "created_at" | "updated_at">
export type InvoiceItemInput = Omit<InvoiceItem, "id">

export async function getInvoices(): Promise<InvoiceWithClient[]> {
  const rows = await sql`
    SELECT i.*, c.company_name, c.contact_name, c.email AS client_email, 
           c.phone AS client_phone, c.address AS client_address, c.city AS client_city, 
           c.vat_number AS client_vat_number
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    ORDER BY i.created_at DESC
  `
  return rows as InvoiceWithClient[]
}

export async function getInvoicesByClient(clientId: number): Promise<Invoice[]> {
  const rows = await sql`SELECT * FROM invoices WHERE client_id = ${clientId} ORDER BY invoice_date DESC`
  return rows as Invoice[]
}

export async function getInvoiceById(id: number): Promise<InvoiceWithClient | null> {
  const rows = await sql`
    SELECT i.*, c.company_name, c.contact_name, c.email AS client_email, 
           c.phone AS client_phone, c.address AS client_address, c.city AS client_city, 
           c.vat_number AS client_vat_number
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE i.id = ${id}
  `
  return (rows[0] as InvoiceWithClient) || null
}

export async function getNextInvoiceNumber(): Promise<string> {
  const rows = await sql`SELECT nextval('invoice_number_seq') AS num`
  const num = rows[0].num
  return String(num).padStart(4, "0")
}

export async function createInvoice(data: InvoiceInput): Promise<Invoice> {
  const result = await sql`
    INSERT INTO invoices (client_id, invoice_number, invoice_date, payment_description, client_unique_code, ref_bolla_number, ref_bolla_date, total_merce, discount_percent, spese_incasso, total_imponibile, total_imposta, total, scadenziario, acconto, notes)
    VALUES (${data.client_id}, ${data.invoice_number}, ${data.invoice_date}, ${data.payment_description}, ${data.client_unique_code}, ${data.ref_bolla_number}, ${data.ref_bolla_date}, ${data.total_merce}, ${data.discount_percent}, ${data.spese_incasso}, ${data.total_imponibile}, ${data.total_imposta}, ${data.total}, ${data.scadenziario}, ${data.acconto}, ${data.notes})
    RETURNING *
  `
  return result[0] as Invoice
}

export async function updateInvoice(id: number, data: Partial<InvoiceInput>): Promise<Invoice | null> {
  const result = await sql`
    UPDATE invoices SET
      client_id = COALESCE(${data.client_id ?? null}, client_id),
      invoice_number = COALESCE(${data.invoice_number ?? null}, invoice_number),
      invoice_date = COALESCE(${data.invoice_date ?? null}, invoice_date),
      payment_description = COALESCE(${data.payment_description ?? null}, payment_description),
      client_unique_code = COALESCE(${data.client_unique_code ?? null}, client_unique_code),
      ref_bolla_number = COALESCE(${data.ref_bolla_number ?? null}, ref_bolla_number),
      ref_bolla_date = COALESCE(${data.ref_bolla_date ?? null}, ref_bolla_date),
      total_merce = COALESCE(${data.total_merce ?? null}, total_merce),
      discount_percent = COALESCE(${data.discount_percent ?? null}, discount_percent),
      spese_incasso = COALESCE(${data.spese_incasso ?? null}, spese_incasso),
      total_imponibile = COALESCE(${data.total_imponibile ?? null}, total_imponibile),
      total_imposta = COALESCE(${data.total_imposta ?? null}, total_imposta),
      total = COALESCE(${data.total ?? null}, total),
      scadenziario = COALESCE(${data.scadenziario ?? null}, scadenziario),
      acconto = COALESCE(${data.acconto ?? null}, acconto),
      notes = COALESCE(${data.notes ?? null}, notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Invoice) || null
}

export async function deleteInvoice(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM invoices WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// Invoice Items
export async function getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
  const rows = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId} ORDER BY sort_order ASC, id ASC`
  return rows as InvoiceItem[]
}

export async function createInvoiceItem(data: InvoiceItemInput): Promise<InvoiceItem> {
  const result = await sql`
    INSERT INTO invoice_items (invoice_id, quantity, description, iva_percent, importo, sort_order)
    VALUES (${data.invoice_id}, ${data.quantity}, ${data.description}, ${data.iva_percent}, ${data.importo}, ${data.sort_order})
    RETURNING *
  `
  return result[0] as InvoiceItem
}

export async function updateInvoiceItem(id: number, data: Partial<InvoiceItemInput>): Promise<InvoiceItem | null> {
  const result = await sql`
    UPDATE invoice_items SET
      quantity = COALESCE(${data.quantity ?? null}, quantity),
      description = COALESCE(${data.description ?? null}, description),
      iva_percent = COALESCE(${data.iva_percent ?? null}, iva_percent),
      importo = COALESCE(${data.importo ?? null}, importo),
      sort_order = COALESCE(${data.sort_order ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as InvoiceItem) || null
}

export async function deleteInvoiceItem(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM invoice_items WHERE id = ${id} RETURNING id`
  return result.length > 0
}

export async function replaceInvoiceItems(invoiceId: number, items: Omit<InvoiceItemInput, "invoice_id">[]): Promise<InvoiceItem[]> {
  await sql`DELETE FROM invoice_items WHERE invoice_id = ${invoiceId}`
  const created: InvoiceItem[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const result = await sql`
      INSERT INTO invoice_items (invoice_id, quantity, description, iva_percent, importo, sort_order)
      VALUES (${invoiceId}, ${item.quantity}, ${item.description}, ${item.iva_percent}, ${item.importo}, ${i})
      RETURNING *
    `
    created.push(result[0] as InvoiceItem)
  }
  return created
}

// ============================================================
// DDTs (Documenti di Trasporto)
// ============================================================

export interface DDT {
  id: number
  client_id: number
  ddt_number: string
  ddt_date: string
  client_fiscal_code: string | null
  payment_conditions: string | null
  aspetto_beni: string | null
  n_colli: number | null
  peso_lordo: number | null
  peso_netto: number | null
  porto: string | null
  causale_trasporto: string | null
  mezzo_trasporto: string | null
  data_ora_trasporto: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DDTWithClient extends DDT {
  company_name: string
  contact_name: string
  client_email: string
  client_phone: string | null
  client_address: string | null
  client_city: string | null
  client_vat_number: string | null
}

export interface DDTItem {
  id: number
  ddt_id: number
  codice_articolo: string | null
  description: string | null
  um: string | null
  quantity: number | null
  prezzo: number | null
  sconto_percent: number | null
  importo: number | null
  sort_order: number
}

export type DDTInput = Omit<DDT, "id" | "created_at" | "updated_at">
export type DDTItemInput = Omit<DDTItem, "id">

export async function getDDTs(): Promise<DDTWithClient[]> {
  const rows = await sql`
    SELECT d.*, c.company_name, c.contact_name, c.email AS client_email,
           c.phone AS client_phone, c.address AS client_address, c.city AS client_city,
           c.vat_number AS client_vat_number
    FROM ddts d
    JOIN clients c ON d.client_id = c.id
    ORDER BY d.created_at DESC
  `
  return rows as DDTWithClient[]
}

export async function getDDTsByClient(clientId: number): Promise<DDT[]> {
  const rows = await sql`SELECT * FROM ddts WHERE client_id = ${clientId} ORDER BY ddt_date DESC`
  return rows as DDT[]
}

export async function getDDTById(id: number): Promise<DDTWithClient | null> {
  const rows = await sql`
    SELECT d.*, c.company_name, c.contact_name, c.email AS client_email,
           c.phone AS client_phone, c.address AS client_address, c.city AS client_city,
           c.vat_number AS client_vat_number
    FROM ddts d
    JOIN clients c ON d.client_id = c.id
    WHERE d.id = ${id}
  `
  return (rows[0] as DDTWithClient) || null
}

export async function getNextDDTNumber(): Promise<string> {
  const rows = await sql`SELECT nextval('ddt_number_seq') AS num`
  const num = rows[0].num
  return String(num).padStart(4, "0")
}

export async function createDDT(data: DDTInput): Promise<DDT> {
  const result = await sql`
    INSERT INTO ddts (client_id, ddt_number, ddt_date, client_fiscal_code, payment_conditions, aspetto_beni, n_colli, peso_lordo, peso_netto, porto, causale_trasporto, mezzo_trasporto, data_ora_trasporto, notes)
    VALUES (${data.client_id}, ${data.ddt_number}, ${data.ddt_date}, ${data.client_fiscal_code}, ${data.payment_conditions}, ${data.aspetto_beni}, ${data.n_colli}, ${data.peso_lordo}, ${data.peso_netto}, ${data.porto}, ${data.causale_trasporto}, ${data.mezzo_trasporto}, ${data.data_ora_trasporto}, ${data.notes})
    RETURNING *
  `
  return result[0] as DDT
}

export async function updateDDT(id: number, data: Partial<DDTInput>): Promise<DDT | null> {
  const result = await sql`
    UPDATE ddts SET
      client_id = COALESCE(${data.client_id ?? null}, client_id),
      ddt_number = COALESCE(${data.ddt_number ?? null}, ddt_number),
      ddt_date = COALESCE(${data.ddt_date ?? null}, ddt_date),
      client_fiscal_code = COALESCE(${data.client_fiscal_code ?? null}, client_fiscal_code),
      payment_conditions = COALESCE(${data.payment_conditions ?? null}, payment_conditions),
      aspetto_beni = COALESCE(${data.aspetto_beni ?? null}, aspetto_beni),
      n_colli = COALESCE(${data.n_colli ?? null}, n_colli),
      peso_lordo = COALESCE(${data.peso_lordo ?? null}, peso_lordo),
      peso_netto = COALESCE(${data.peso_netto ?? null}, peso_netto),
      porto = COALESCE(${data.porto ?? null}, porto),
      causale_trasporto = COALESCE(${data.causale_trasporto ?? null}, causale_trasporto),
      mezzo_trasporto = COALESCE(${data.mezzo_trasporto ?? null}, mezzo_trasporto),
      data_ora_trasporto = COALESCE(${data.data_ora_trasporto ?? null}, data_ora_trasporto),
      notes = COALESCE(${data.notes ?? null}, notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as DDT) || null
}

export async function deleteDDT(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM ddts WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// DDT Items
export async function getDDTItems(ddtId: number): Promise<DDTItem[]> {
  const rows = await sql`SELECT * FROM ddt_items WHERE ddt_id = ${ddtId} ORDER BY sort_order ASC, id ASC`
  return rows as DDTItem[]
}

export async function createDDTItem(data: DDTItemInput): Promise<DDTItem> {
  const result = await sql`
    INSERT INTO ddt_items (ddt_id, codice_articolo, description, um, quantity, prezzo, sconto_percent, importo, sort_order)
    VALUES (${data.ddt_id}, ${data.codice_articolo}, ${data.description}, ${data.um}, ${data.quantity}, ${data.prezzo}, ${data.sconto_percent}, ${data.importo}, ${data.sort_order})
    RETURNING *
  `
  return result[0] as DDTItem
}

export async function deleteDDTItem(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM ddt_items WHERE id = ${id} RETURNING id`
  return result.length > 0
}

export async function replaceDDTItems(ddtId: number, items: Omit<DDTItemInput, "ddt_id">[]): Promise<DDTItem[]> {
  await sql`DELETE FROM ddt_items WHERE ddt_id = ${ddtId}`
  const created: DDTItem[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const result = await sql`
      INSERT INTO ddt_items (ddt_id, codice_articolo, description, um, quantity, prezzo, sconto_percent, importo, sort_order)
      VALUES (${ddtId}, ${item.codice_articolo}, ${item.description}, ${item.um}, ${item.quantity}, ${item.prezzo}, ${item.sconto_percent}, ${item.importo}, ${i})
      RETURNING *
    `
    created.push(result[0] as DDTItem)
  }
  return created
}
