import { NextResponse } from "next/server"
import { updateModalitaPagamento, deleteModalitaPagamento, type ModalitaPagamentoInput } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body: ModalitaPagamentoInput = await request.json()
    const modalita = await updateModalitaPagamento(Number(id), {
      codice: body.codice,
      descrizione: body.descrizione,
      giorni_scadenza: body.giorni_scadenza || 0,
      is_attiva: body.is_attiva ?? true,
    })

    if (!modalita) {
      return NextResponse.json({ error: "Modalita not found" }, { status: 404 })
    }

    return NextResponse.json(modalita)
  } catch (error) {
    console.error("Error updating modalita pagamento:", error)
    return NextResponse.json({ error: "Failed to update modalita pagamento" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteModalitaPagamento(Number(id))

    if (!deleted) {
      return NextResponse.json({ error: "Modalita not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting modalita pagamento:", error)
    return NextResponse.json({ error: "Failed to delete modalita pagamento" }, { status: 500 })
  }
}
