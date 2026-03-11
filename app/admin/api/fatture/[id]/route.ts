import { NextResponse } from "next/server"
import { getFatturaConRighe, updateFattura, deleteFattura, addRigaFattura, deleteRigaFattura, getRigheFattura, type FatturaInput } from "@/lib/db"

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

    const result = await getFatturaConRighe(fatturaId)

    if (!result) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching fattura:", error)
    return NextResponse.json({ error: "Failed to fetch fattura" }, { status: 500 })
  }
}

interface RigaInput {
  id?: number
  posizione: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  aliquota_iva_id: number | null
  percentuale_iva: number
}

interface FatturaUpdateBody extends Partial<FatturaInput> {
  righe?: RigaInput[]
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fatturaId = parseInt(id, 10)

    if (isNaN(fatturaId)) {
      return NextResponse.json({ error: "Invalid fattura ID" }, { status: 400 })
    }

    const body: FatturaUpdateBody = await request.json()
    const { righe, ...fatturaData } = body

    // Update fattura
    const fattura = await updateFattura(fatturaId, fatturaData)

    if (!fattura) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    // Update righe if provided
    if (righe) {
      // Get existing righe
      const existingRighe = await getRigheFattura(fatturaId)
      const existingIds = existingRighe.map(r => r.id)
      const updatedIds = righe.filter(r => r.id).map(r => r.id!)

      // Delete removed righe
      for (const existingId of existingIds) {
        if (!updatedIds.includes(existingId)) {
          await deleteRigaFattura(existingId)
        }
      }

      // Add new righe (ones without id)
      for (const riga of righe) {
        if (!riga.id) {
          await addRigaFattura({
            fattura_id: fatturaId,
            posizione: riga.posizione,
            descrizione: riga.descrizione,
            quantita: riga.quantita,
            prezzo_unitario: riga.prezzo_unitario,
            aliquota_iva_id: riga.aliquota_iva_id,
            percentuale_iva: riga.percentuale_iva,
          })
        }
      }
    }

    return NextResponse.json(fattura)
  } catch (error) {
    console.error("Error updating fattura:", error)
    return NextResponse.json({ error: "Failed to update fattura" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fatturaId = parseInt(id, 10)

    if (isNaN(fatturaId)) {
      return NextResponse.json({ error: "Invalid fattura ID" }, { status: 400 })
    }

    const deleted = await deleteFattura(fatturaId)

    if (!deleted) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting fattura:", error)
    return NextResponse.json({ error: "Failed to delete fattura" }, { status: 500 })
  }
}
