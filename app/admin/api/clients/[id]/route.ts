import { NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient, type ClientInput } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientId = parseInt(id, 10)

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const client = await getClientById(clientId)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientId = parseInt(id, 10)

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const body: ClientInput = await request.json()

    if (!body.ragione_sociale) {
      return NextResponse.json(
        { error: "ragione_sociale is required" },
        { status: 400 }
      )
    }

    const client = await updateClient(clientId, {
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

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientId = parseInt(id, 10)

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const deleted = await deleteClient(clientId)

    if (!deleted) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
