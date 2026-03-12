import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Interface aligned with 'clienti' table in Neon database
export interface Client {
  id: number
  ragione_sociale: string
  codice_fiscale: string | null
  partita_iva: string | null
  email: string | null
  telefono: string | null
  pec: string | null
  indirizzo: string | null
  citta: string | null
  provincia: string | null
  cap: string | null
  codice_univoco: string | null
  created_at: string
  updated_at: string
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">

export async function getClients(): Promise<Client[]> {
  const clients = await sql`SELECT * FROM clienti ORDER BY created_at DESC`
  return clients as Client[]
}

export async function getClientById(id: number): Promise<Client | null> {
  const clients = await sql`SELECT * FROM clienti WHERE id = ${id}`
  return (clients[0] as Client) || null
}

export async function createClient(data: ClientInput): Promise<Client> {
  const result = await sql`
    INSERT INTO clienti (ragione_sociale, codice_fiscale, partita_iva, email, telefono, pec, indirizzo, citta, provincia, cap, codice_univoco)
    VALUES (${data.ragione_sociale}, ${data.codice_fiscale}, ${data.partita_iva}, ${data.email}, ${data.telefono}, ${data.pec}, ${data.indirizzo}, ${data.citta}, ${data.provincia}, ${data.cap}, ${data.codice_univoco})
    RETURNING *
  `
  return result[0] as Client
}

export async function updateClient(id: number, data: ClientInput): Promise<Client | null> {
  const result = await sql`
    UPDATE clienti 
    SET 
      ragione_sociale = ${data.ragione_sociale},
      codice_fiscale = ${data.codice_fiscale},
      partita_iva = ${data.partita_iva},
      email = ${data.email},
      telefono = ${data.telefono},
      pec = ${data.pec},
      indirizzo = ${data.indirizzo},
      citta = ${data.citta},
      provincia = ${data.provincia},
      cap = ${data.cap},
      codice_univoco = ${data.codice_univoco},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Client) || null
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM clienti WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// ============================================
// FATTURE (Invoices)
// ============================================

export interface Fattura {
  id: number
  numero_fattura: string
  data_documento: string
  cliente_id: number
  rif_bolla_numero: string | null
  rif_bolla_data: string | null
  modalita_pagamento_id: number | null
  descrizione_pagamento: string | null
  iban: string | null
  sconto_percentuale: number | null
  spese_incasso: number | null
  acconto: number | null
  totale_merce: number | null
  totale_imponibile: number | null
  totale_imposta: number | null
  totale_fattura: number | null
  stato: string
  note: string | null
  created_at: string
  updated_at: string
}

export type FatturaInput = Omit<Fattura, "id" | "created_at" | "updated_at" | "totale_merce" | "totale_imponibile" | "totale_imposta" | "totale_fattura">

export interface RigaFattura {
  id: number
  fattura_id: number
  posizione: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  aliquota_iva_id: number | null
  percentuale_iva: number
  importo_netto: number
  importo_iva: number
  importo_totale: number
  created_at: string
}

export type RigaFatturaInput = Omit<RigaFattura, "id" | "created_at" | "importo_netto" | "importo_iva" | "importo_totale">

export interface AliquotaIva {
  id: number
  percentuale: number
  descrizione: string
  is_attiva: boolean
}

export interface ModalitaPagamento {
  id: number
  codice: string
  descrizione: string
  giorni_scadenza: number
  is_attiva: boolean
}

export interface Scadenza {
  id: number
  fattura_id: number
  numero_rata: number
  data_scadenza: string
  importo: number
  stato: string
  data_pagamento: string | null
  note: string | null
  created_at: string
}

// Vista fatture complete (per elenco fatture)
export interface FatturaCompleta {
  id: number
  numero_fattura: string
  data_documento: string
  ragione_sociale: string
  partita_iva: string | null
  codice_fiscale: string | null
  codice_univoco: string | null
  totale_fattura: number
  acconto: number | null
  da_pagare: number
  stato: string
  modalita_pagamento: string | null
}

// Vista scadenze pendenti
export interface ScadenzaPendente {
  id: number
  numero_fattura: string
  ragione_sociale: string
  data_scadenza: string
  importo: number
  stato: string
  numero_rata: number
  urgenza: string
}

// FATTURE CRUD
export async function getFatture(): Promise<FatturaCompleta[]> {
  const fatture = await sql`SELECT * FROM v_fatture_complete ORDER BY data_documento DESC`
  return fatture as FatturaCompleta[]
}

export async function getFatturaById(id: number): Promise<Fattura | null> {
  const fatture = await sql`SELECT * FROM fatture WHERE id = ${id}`
  return (fatture[0] as Fattura) || null
}

export async function getFatturaConRighe(id: number): Promise<{ fattura: Fattura; righe: RigaFattura[]; cliente: Client } | null> {
  const fatture = await sql`SELECT * FROM fatture WHERE id = ${id}`
  if (!fatture[0]) return null
  
  const righe = await sql`SELECT * FROM righe_fattura WHERE fattura_id = ${id} ORDER BY posizione`
  const clienti = await sql`SELECT * FROM clienti WHERE id = ${(fatture[0] as Fattura).cliente_id}`
  
  return {
    fattura: fatture[0] as Fattura,
    righe: righe as RigaFattura[],
    cliente: clienti[0] as Client
  }
}

export async function createFattura(data: FatturaInput): Promise<Fattura> {
  const result = await sql`
    INSERT INTO fatture (numero_fattura, data_documento, cliente_id, rif_bolla_numero, rif_bolla_data, 
      modalita_pagamento_id, descrizione_pagamento, iban, sconto_percentuale, spese_incasso, acconto, stato, note)
    VALUES (${data.numero_fattura}, ${data.data_documento}, ${data.cliente_id}, ${data.rif_bolla_numero}, 
      ${data.rif_bolla_data}, ${data.modalita_pagamento_id}, ${data.descrizione_pagamento}, ${data.iban}, 
      ${data.sconto_percentuale}, ${data.spese_incasso}, ${data.acconto}, ${data.stato}, ${data.note})
    RETURNING *
  `
  return result[0] as Fattura
}

export async function updateFattura(id: number, data: Partial<FatturaInput>): Promise<Fattura | null> {
  const result = await sql`
    UPDATE fatture 
    SET 
      numero_fattura = COALESCE(${data.numero_fattura}, numero_fattura),
      data_documento = COALESCE(${data.data_documento}, data_documento),
      cliente_id = COALESCE(${data.cliente_id}, cliente_id),
      rif_bolla_numero = ${data.rif_bolla_numero},
      rif_bolla_data = ${data.rif_bolla_data},
      modalita_pagamento_id = ${data.modalita_pagamento_id},
      descrizione_pagamento = ${data.descrizione_pagamento},
      iban = ${data.iban},
      sconto_percentuale = ${data.sconto_percentuale},
      spese_incasso = ${data.spese_incasso},
      acconto = ${data.acconto},
      stato = COALESCE(${data.stato}, stato),
      note = ${data.note},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Fattura) || null
}

export async function deleteFattura(id: number): Promise<boolean> {
  // Delete related records first
  await sql`DELETE FROM scadenziario WHERE fattura_id = ${id}`
  await sql`DELETE FROM righe_fattura WHERE fattura_id = ${id}`
  const result = await sql`DELETE FROM fatture WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// RIGHE FATTURA CRUD
export async function getRigheFattura(fatturaId: number): Promise<RigaFattura[]> {
  const righe = await sql`SELECT * FROM righe_fattura WHERE fattura_id = ${fatturaId} ORDER BY posizione`
  return righe as RigaFattura[]
}

export async function addRigaFattura(data: RigaFatturaInput): Promise<RigaFattura> {
  // Calculate the computed fields
  const importo_netto = data.quantita * data.prezzo_unitario
  const importo_iva = importo_netto * (data.percentuale_iva / 100)
  const importo_totale = importo_netto + importo_iva

  const result = await sql`
    INSERT INTO righe_fattura (fattura_id, posizione, descrizione, quantita, prezzo_unitario, 
      aliquota_iva_id, percentuale_iva, importo_netto, importo_iva, importo_totale)
    VALUES (${data.fattura_id}, ${data.posizione}, ${data.descrizione}, ${data.quantita}, 
      ${data.prezzo_unitario}, ${data.aliquota_iva_id}, ${data.percentuale_iva},
      ${importo_netto}, ${importo_iva}, ${importo_totale})
    RETURNING *
  `
  return result[0] as RigaFattura
}

export async function updateRigaFattura(id: number, data: Partial<RigaFatturaInput>): Promise<RigaFattura | null> {
  const result = await sql`
    UPDATE righe_fattura 
    SET 
      descrizione = COALESCE(${data.descrizione}, descrizione),
      quantita = COALESCE(${data.quantita}, quantita),
      prezzo_unitario = COALESCE(${data.prezzo_unitario}, prezzo_unitario),
      aliquota_iva_id = ${data.aliquota_iva_id},
      percentuale_iva = COALESCE(${data.percentuale_iva}, percentuale_iva)
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as RigaFattura) || null
}

export async function deleteRigaFattura(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM righe_fattura WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// ALIQUOTE IVA
export async function getAliquoteIva(): Promise<AliquotaIva[]> {
  const aliquote = await sql`SELECT * FROM aliquote_iva WHERE is_attiva = true ORDER BY percentuale`
  return aliquote as AliquotaIva[]
}

// MODALITA PAGAMENTO
export async function getModalitaPagamento(): Promise<ModalitaPagamento[]> {
  const modalita = await sql`SELECT * FROM modalita_pagamento WHERE is_attiva = true ORDER BY descrizione`
  return modalita as ModalitaPagamento[]
}

// SCADENZIARIO
export async function getScadenzePendenti(): Promise<ScadenzaPendente[]> {
  const scadenze = await sql`SELECT * FROM v_scadenze_pendenti ORDER BY data_scadenza`
  return scadenze as ScadenzaPendente[]
}

export async function getScadenzeFattura(fatturaId: number): Promise<Scadenza[]> {
  const scadenze = await sql`SELECT * FROM scadenziario WHERE fattura_id = ${fatturaId} ORDER BY numero_rata`
  return scadenze as Scadenza[]
}

export async function updateScadenza(id: number, data: { stato: string; data_pagamento?: string | null; note?: string | null }): Promise<Scadenza | null> {
  const result = await sql`
    UPDATE scadenziario 
    SET stato = ${data.stato}, data_pagamento = ${data.data_pagamento || null}, note = ${data.note || null}
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Scadenza) || null
}

// STATISTICHE DASHBOARD
export async function getDashboardStats(): Promise<{
  totaleClienti: number
  totalefatture: number
  fattureNonPagate: number
  scadenzeUrgenti: number
  totaleIncassi: number
  totaleCrediti: number
}> {
  const clientiResult = await sql`SELECT COUNT(*) as count FROM clienti`
  const fattureResult = await sql`SELECT COUNT(*) as count FROM fatture`
  const nonPagateResult = await sql`SELECT COUNT(*) as count FROM fatture WHERE stato != 'pagata'`
  const scadenzeResult = await sql`SELECT COUNT(*) as count FROM v_scadenze_pendenti WHERE urgenza IN ('scaduta', 'urgente')`
  const incassiResult = await sql`SELECT COALESCE(SUM(totale_fattura), 0) as total FROM fatture WHERE stato = 'pagata'`
  const creditiResult = await sql`SELECT COALESCE(SUM(da_pagare), 0) as total FROM v_fatture_complete WHERE stato != 'pagata'`

  return {
    totaleClienti: Number(clientiResult[0]?.count || 0),
    totalefatture: Number(fattureResult[0]?.count || 0),
    fattureNonPagate: Number(nonPagateResult[0]?.count || 0),
    scadenzeUrgenti: Number(scadenzeResult[0]?.count || 0),
    totaleIncassi: Number(incassiResult[0]?.total || 0),
    totaleCrediti: Number(creditiResult[0]?.total || 0)
  }
}
