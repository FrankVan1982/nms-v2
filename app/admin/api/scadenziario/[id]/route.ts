import { NextResponse } from "next/server"
import { updateScadenza } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const scadenza = await updateScadenza(Number(id), {
      stato: body.stato,
      data_pagamento: body.data_pagamento || null,
      note: body.note || null,
    })

    if (!scadenza) {
      return NextResponse.json({ error: "Scadenza not found" }, { status: 404 })
    }

    return NextResponse.json(scadenza)
  } catch (error) {
    console.error("Error updating scadenza:", error)
    return NextResponse.json({ error: "Failed to update scadenza" }, { status: 500 })
  }
}
