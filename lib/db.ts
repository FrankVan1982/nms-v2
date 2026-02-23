import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Client {
  id: number
  ragione_sociale: string
  codice_fiscale: string | null
  partita_iva: string | null
  codice_univoco: string | null
  email: string | null
  pec: string | null
  telefono: string | null
  indirizzo: string | null
  citta: string | null
  provincia: string | null
  cap: string | null
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
    INSERT INTO clienti (ragione_sociale, codice_fiscale, partita_iva, codice_univoco, email, pec, telefono, indirizzo, citta, provincia, cap)
    VALUES (${data.ragione_sociale}, ${data.codice_fiscale}, ${data.partita_iva}, ${data.codice_univoco}, ${data.email}, ${data.pec}, ${data.telefono}, ${data.indirizzo}, ${data.citta}, ${data.provincia}, ${data.cap})
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
      codice_univoco = ${data.codice_univoco},
      email = ${data.email},
      pec = ${data.pec},
      telefono = ${data.telefono},
      indirizzo = ${data.indirizzo},
      citta = ${data.citta},
      provincia = ${data.provincia},
      cap = ${data.cap},
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

// ==================== ALIQUOTE IVA ====================

export interface AliquotaIva {
  id: number
  descrizione: string
  percentuale: number
  is_attiva: boolean
}

export type AliquotaIvaInput = Omit<AliquotaIva, "id">

export async function getAliquoteIva(): Promise<AliquotaIva[]> {
  const rows = await sql`SELECT * FROM aliquote_iva ORDER BY percentuale ASC`
  return rows as AliquotaIva[]
}

export async function createAliquotaIva(data: AliquotaIvaInput): Promise<AliquotaIva> {
  const result = await sql`
    INSERT INTO aliquote_iva (descrizione, percentuale, is_attiva)
    VALUES (${data.descrizione}, ${data.percentuale}, ${data.is_attiva})
    RETURNING *
  `
  return result[0] as AliquotaIva
}

export async function updateAliquotaIva(id: number, data: AliquotaIvaInput): Promise<AliquotaIva | null> {
  const result = await sql`
    UPDATE aliquote_iva SET descrizione = ${data.descrizione}, percentuale = ${data.percentuale}, is_attiva = ${data.is_attiva}
    WHERE id = ${id} RETURNING *
  `
  return (result[0] as AliquotaIva) || null
}

export async function deleteAliquotaIva(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM aliquote_iva WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// ==================== MODALITA PAGAMENTO ====================

export interface ModalitaPagamento {
  id: number
  codice: string
  descrizione: string
  giorni_scadenza: number
  is_attiva: boolean
}

export type ModalitaPagamentoInput = Omit<ModalitaPagamento, "id">

export async function getModalitaPagamento(): Promise<ModalitaPagamento[]> {
  const rows = await sql`SELECT * FROM modalita_pagamento ORDER BY codice ASC`
  return rows as ModalitaPagamento[]
}

export async function createModalitaPagamento(data: ModalitaPagamentoInput): Promise<ModalitaPagamento> {
  const result = await sql`
    INSERT INTO modalita_pagamento (codice, descrizione, giorni_scadenza, is_attiva)
    VALUES (${data.codice}, ${data.descrizione}, ${data.giorni_scadenza}, ${data.is_attiva})
    RETURNING *
  `
  return result[0] as ModalitaPagamento
}

export async function updateModalitaPagamento(id: number, data: ModalitaPagamentoInput): Promise<ModalitaPagamento | null> {
  const result = await sql`
    UPDATE modalita_pagamento SET codice = ${data.codice}, descrizione = ${data.descrizione}, giorni_scadenza = ${data.giorni_scadenza}, is_attiva = ${data.is_attiva}
    WHERE id = ${id} RETURNING *
  `
  return (result[0] as ModalitaPagamento) || null
}

export async function deleteModalitaPagamento(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM modalita_pagamento WHERE id = ${id} RETURNING id`
  return result.length > 0
}

// ==================== FATTURE ====================

export interface Fattura {
  id: number
  numero_fattura: string
  data_documento: string
  cliente_id: number
  rif_bolla_numero: string | null
  rif_bolla_data: string | null
  descrizione_pagamento: string | null
  iban: string | null
  modalita_pagamento_id: number | null
  note: string | null
  spese_incasso: number
  sconto_percentuale: number
  totale_merce: number
  totale_imponibile: number
  totale_imposta: number
  totale_fattura: number
  acconto: number
  stato: string
  created_at: string
  updated_at: string
}

export type FatturaInput = Omit<Fattura, "id" | "created_at" | "updated_at">

export interface RigaFattura {
  id: number
  fattura_id: number
  posizione: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  percentuale_iva: number
  aliquota_iva_id: number | null
  importo_netto: number
  importo_iva: number
  importo_totale: number
  created_at: string
}

export type RigaFatturaInput = Omit<RigaFattura, "id" | "created_at">

export interface FatturaCompleta {
  id: number
  numero_fattura: string
  data_documento: string
  ragione_sociale: string
  partita_iva: string | null
  codice_fiscale: string | null
  codice_univoco: string | null
  stato: string
  modalita_pagamento: string | null
  totale_fattura: number
  acconto: number
  da_pagare: number
}

export async function getFattureComplete(): Promise<FatturaCompleta[]> {
  const rows = await sql`SELECT * FROM v_fatture_complete ORDER BY data_documento DESC`
  return rows as FatturaCompleta[]
}

export async function getFatturaById(id: number): Promise<Fattura | null> {
  const rows = await sql`SELECT * FROM fatture WHERE id = ${id}`
  return (rows[0] as Fattura) || null
}

export async function getRigheFattura(fatturaId: number): Promise<RigaFattura[]> {
  const rows = await sql`SELECT * FROM righe_fattura WHERE fattura_id = ${fatturaId} ORDER BY posizione ASC`
  return rows as RigaFattura[]
}

export async function createFattura(data: FatturaInput): Promise<Fattura> {
  const result = await sql`
    INSERT INTO fatture (numero_fattura, data_documento, cliente_id, rif_bolla_numero, rif_bolla_data, descrizione_pagamento, iban, modalita_pagamento_id, note, spese_incasso, sconto_percentuale, totale_merce, totale_imponibile, totale_imposta, totale_fattura, acconto, stato)
    VALUES (${data.numero_fattura}, ${data.data_documento}, ${data.cliente_id}, ${data.rif_bolla_numero}, ${data.rif_bolla_data}, ${data.descrizione_pagamento}, ${data.iban}, ${data.modalita_pagamento_id}, ${data.note}, ${data.spese_incasso}, ${data.sconto_percentuale}, ${data.totale_merce}, ${data.totale_imponibile}, ${data.totale_imposta}, ${data.totale_fattura}, ${data.acconto}, ${data.stato})
    RETURNING *
  `
  return result[0] as Fattura
}

export async function updateFattura(id: number, data: FatturaInput): Promise<Fattura | null> {
  const result = await sql`
    UPDATE fatture SET
      numero_fattura = ${data.numero_fattura}, data_documento = ${data.data_documento}, cliente_id = ${data.cliente_id},
      rif_bolla_numero = ${data.rif_bolla_numero}, rif_bolla_data = ${data.rif_bolla_data},
      descrizione_pagamento = ${data.descrizione_pagamento}, iban = ${data.iban},
      modalita_pagamento_id = ${data.modalita_pagamento_id}, note = ${data.note},
      spese_incasso = ${data.spese_incasso}, sconto_percentuale = ${data.sconto_percentuale},
      totale_merce = ${data.totale_merce}, totale_imponibile = ${data.totale_imponibile},
      totale_imposta = ${data.totale_imposta}, totale_fattura = ${data.totale_fattura},
      acconto = ${data.acconto}, stato = ${data.stato}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `
  return (result[0] as Fattura) || null
}

export async function deleteFattura(id: number): Promise<boolean> {
  await sql`DELETE FROM scadenziario WHERE fattura_id = ${id}`
  await sql`DELETE FROM righe_fattura WHERE fattura_id = ${id}`
  const result = await sql`DELETE FROM fatture WHERE id = ${id} RETURNING id`
  return result.length > 0
}

export async function createRigaFattura(data: RigaFatturaInput): Promise<RigaFattura> {
  const result = await sql`
    INSERT INTO righe_fattura (fattura_id, posizione, descrizione, quantita, prezzo_unitario, percentuale_iva, aliquota_iva_id, importo_netto, importo_iva, importo_totale)
    VALUES (${data.fattura_id}, ${data.posizione}, ${data.descrizione}, ${data.quantita}, ${data.prezzo_unitario}, ${data.percentuale_iva}, ${data.aliquota_iva_id}, ${data.importo_netto}, ${data.importo_iva}, ${data.importo_totale})
    RETURNING *
  `
  return result[0] as RigaFattura
}

export async function deleteRigheFattura(fatturaId: number): Promise<void> {
  await sql`DELETE FROM righe_fattura WHERE fattura_id = ${fatturaId}`
}

// ==================== SCADENZIARIO ====================

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

export type ScadenzaInput = Omit<Scadenza, "id" | "created_at">

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

export async function getScadenzePendenti(): Promise<ScadenzaPendente[]> {
  const rows = await sql`SELECT * FROM v_scadenze_pendenti ORDER BY data_scadenza ASC`
  return rows as ScadenzaPendente[]
}

export async function getScadenzeByFattura(fatturaId: number): Promise<Scadenza[]> {
  const rows = await sql`SELECT * FROM scadenziario WHERE fattura_id = ${fatturaId} ORDER BY numero_rata ASC`
  return rows as Scadenza[]
}

export async function createScadenza(data: ScadenzaInput): Promise<Scadenza> {
  const result = await sql`
    INSERT INTO scadenziario (fattura_id, numero_rata, data_scadenza, importo, stato, data_pagamento, note)
    VALUES (${data.fattura_id}, ${data.numero_rata}, ${data.data_scadenza}, ${data.importo}, ${data.stato}, ${data.data_pagamento}, ${data.note})
    RETURNING *
  `
  return result[0] as Scadenza
}

export async function updateScadenza(id: number, data: Partial<ScadenzaInput>): Promise<Scadenza | null> {
  const result = await sql`
    UPDATE scadenziario SET
      stato = COALESCE(${data.stato ?? null}, stato),
      data_pagamento = COALESCE(${data.data_pagamento ?? null}, data_pagamento),
      note = COALESCE(${data.note ?? null}, note)
    WHERE id = ${id} RETURNING *
  `
  return (result[0] as Scadenza) || null
}

export async function deleteScadenzeByFattura(fatturaId: number): Promise<void> {
  await sql`DELETE FROM scadenziario WHERE fattura_id = ${fatturaId}`
}

// ==================== DASHBOARD ====================

export interface DashboardData {
  totale_fatture: number
  totale_da_incassare: number
  scadenze_urgenti: number
  clienti_attivi: number
  fatture_recenti: FatturaCompleta[]
  scadenze_prossime: ScadenzaPendente[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const [fattureRes, scadenzeRes, clientiRes, urgentiRes] = await Promise.all([
    sql`SELECT COUNT(*) as count, COALESCE(SUM(totale_fattura), 0) as totale FROM fatture`,
    sql`SELECT COALESCE(SUM(importo), 0) as da_incassare FROM scadenziario WHERE stato != 'pagata'`,
    sql`SELECT COUNT(*) as count FROM clienti`,
    sql`SELECT COUNT(*) as count FROM v_scadenze_pendenti WHERE urgenza = 'scaduta' OR urgenza = 'urgente'`,
  ])

  const [fattureRecenti, scadenzeProssime] = await Promise.all([
    sql`SELECT * FROM v_fatture_complete ORDER BY data_documento DESC LIMIT 5`,
    sql`SELECT * FROM v_scadenze_pendenti ORDER BY data_scadenza ASC LIMIT 5`,
  ])

  return {
    totale_fatture: Number(fattureRes[0].count),
    totale_da_incassare: Number(scadenzeRes[0].da_incassare),
    scadenze_urgenti: Number(urgentiRes[0].count),
    clienti_attivi: Number(clientiRes[0].count),
    fatture_recenti: fattureRecenti as FatturaCompleta[],
    scadenze_prossime: scadenzeProssime as ScadenzaPendente[],
  }
}
