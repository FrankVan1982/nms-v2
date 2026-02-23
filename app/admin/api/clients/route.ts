import { NextResponse } from "next/server"
import { getClients, createClient, type ClientInput } from "@/lib/db"

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: ClientInput = await request.json()

    if (!body.ragione_sociale) {
      return NextResponse.json(
        { error: "ragione_sociale is required" },
        { status: 400 }
      )
    }

    const client = await createClient({
      ragione_sociale: body.ragione_sociale,
      codice_fiscale: body.codice_fiscale || null,
      partita_iva: body.partita_iva || null,
      codice_univoco: body.codice_univoco || null,
      email: body.email || null,
      pec: body.pec || null,
      telefono: body.telefono || null,
      indirizzo: body.indirizzo || null,
      citta: body.citta || null,
      provincia: body.provincia || null,
      cap: body.cap || null,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
