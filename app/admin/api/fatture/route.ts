import { NextResponse } from "next/server"
import { getFatture, createFattura, addRigaFattura, type FatturaInput, type RigaFatturaInput } from "@/lib/db"

export async function GET() {
  try {
    const fatture = await getFatture()
    return NextResponse.json(fatture)
  } catch (error) {
    console.error("Error fetching fatture:", error)
    return NextResponse.json({ error: "Failed to fetch fatture" }, { status: 500 })
  }
}

interface RigaInput {
  posizione: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  aliquota_iva_id: number | null
  percentuale_iva: number
}

interface FatturaWithRighe extends FatturaInput {
  righe?: RigaInput[]
}

export async function POST(request: Request) {
  try {
    const body: FatturaWithRighe = await request.json()

    if (!body.numero_fattura || !body.data_documento || !body.cliente_id) {
      return NextResponse.json(
        { error: "numero_fattura, data_documento, and cliente_id are required" },
        { status: 400 }
      )
    }

    // Create the fattura first
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

    // Add righe if provided
    if (body.righe && body.righe.length > 0) {
      for (const riga of body.righe) {
        await addRigaFattura({
          fattura_id: fattura.id,
          posizione: riga.posizione,
          descrizione: riga.descrizione,
          quantita: riga.quantita,
          prezzo_unitario: riga.prezzo_unitario,
          aliquota_iva_id: riga.aliquota_iva_id,
          percentuale_iva: riga.percentuale_iva,
        })
      }
    }

    return NextResponse.json(fattura, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating fattura:", error)
    
    // Check for duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ 
        error: "Numero fattura gia esistente. Utilizzare un numero diverso." 
      }, { status: 409 })
    }
    
    return NextResponse.json({ error: "Failed to create fattura" }, { status: 500 })
  }
}
