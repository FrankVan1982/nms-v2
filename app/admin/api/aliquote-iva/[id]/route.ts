import { NextResponse } from "next/server"
import { updateAliquotaIva, deleteAliquotaIva, type AliquotaIvaInput } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body: AliquotaIvaInput = await request.json()
    const aliquota = await updateAliquotaIva(Number(id), {
      descrizione: body.descrizione,
      percentuale: body.percentuale,
      is_attiva: body.is_attiva ?? true,
    })

    if (!aliquota) {
      return NextResponse.json({ error: "Aliquota not found" }, { status: 404 })
    }

    return NextResponse.json(aliquota)
  } catch (error) {
    console.error("Error updating aliquota IVA:", error)
    return NextResponse.json({ error: "Failed to update aliquota IVA" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteAliquotaIva(Number(id))

    if (!deleted) {
      return NextResponse.json({ error: "Aliquota not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting aliquota IVA:", error)
    return NextResponse.json({ error: "Failed to delete aliquota IVA" }, { status: 500 })
  }
}
