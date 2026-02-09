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

    if (!body.company_name || !body.contact_name || !body.email) {
      return NextResponse.json(
        { error: "company_name, contact_name, and email are required" },
        { status: 400 }
      )
    }

    const client = await updateClient(clientId, {
      company_name: body.company_name,
      contact_name: body.contact_name,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      country: body.country || null,
      vat_number: body.vat_number || null,
      notes: body.notes || null,
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
