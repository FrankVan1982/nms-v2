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

    if (!body.company_name || !body.contact_name || !body.email) {
      return NextResponse.json(
        { error: "company_name, contact_name, and email are required" },
        { status: 400 }
      )
    }

    const client = await createClient({
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

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
