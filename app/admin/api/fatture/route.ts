import { NextResponse } from "next/server"
import { getFatture, createFattura, type FatturaInput } from "@/lib/db"

export async function GET() {
  try {
    const fatture = await getFatture()
    return NextResponse.json(fatture)
  } catch (error) {
    console.error("Error fetching fatture:", error)
    return NextResponse.json({ error: "Failed to fetch fatture" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: FatturaInput = await request.json()

    if (!body.numero_fattura || !body.data_documento || !body.cliente_id) {
      return NextResponse.json(
        { error: "numero_fattura, data_documento, and cliente_id are required" },
        { status: 400 }
      )
    }

    const fattura = await createFattura({
      numero_fattura: body.numero_fattura,
      data_documento: body.data_documento,
      cliente_id: body.cliente_id,
      rif_bolla_numero: body.rif_bolla_numero || null,
      rif_bolla_data: body.rif_bolla_data || null,
      modalita_pagamento_id: body.modalita_pagamento_id || null,
      descrizione_pagamento: body.descrizione_pagamento || null,
      iban: body.iban || null,
      sconto_percentuale: body.sconto_percentuale || null,
      spese_incasso: body.spese_incasso || null,
      acconto: body.acconto || null,
      stato: body.stato || "bozza",
      note: body.note || null,
    })

    return NextResponse.json(fattura, { status: 201 })
  } catch (error) {
    console.error("Error creating fattura:", error)
    return NextResponse.json({ error: "Failed to create fattura" }, { status: 500 })
  }
}
