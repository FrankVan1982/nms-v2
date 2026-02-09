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
