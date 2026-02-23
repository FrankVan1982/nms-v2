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
