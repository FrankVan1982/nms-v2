import { NextResponse } from "next/server"
import { getRigheFattura, addRigaFattura, type RigaFatturaInput } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fatturaId = parseInt(id, 10)

    if (isNaN(fatturaId)) {
      return NextResponse.json({ error: "Invalid fattura ID" }, { status: 400 })
    }

    const righe = await getRigheFattura(fatturaId)
    return NextResponse.json(righe)
  } catch (error) {
    console.error("Error fetching righe:", error)
    return NextResponse.json({ error: "Failed to fetch righe" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fatturaId = parseInt(id, 10)

    if (isNaN(fatturaId)) {
      return NextResponse.json({ error: "Invalid fattura ID" }, { status: 400 })
    }

    const body: Omit<RigaFatturaInput, "fattura_id"> = await request.json()

    if (!body.descrizione || body.quantita === undefined || body.prezzo_unitario === undefined) {
      return NextResponse.json(
        { error: "descrizione, quantita, and prezzo_unitario are required" },
        { status: 400 }
      )
    }

    const riga = await addRigaFattura({
      fattura_id: fatturaId,
      posizione: body.posizione || 1,
      descrizione: body.descrizione,
      quantita: body.quantita,
      prezzo_unitario: body.prezzo_unitario,
      aliquota_iva_id: body.aliquota_iva_id || null,
      percentuale_iva: body.percentuale_iva || 22,
    })

    return NextResponse.json(riga, { status: 201 })
  } catch (error) {
    console.error("Error adding riga:", error)
    return NextResponse.json({ error: "Failed to add riga" }, { status: 500 })
  }
}
