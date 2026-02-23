import { NextResponse } from "next/server"
import { getModalitaPagamento, createModalitaPagamento, type ModalitaPagamentoInput } from "@/lib/db"

export async function GET() {
  try {
    const modalita = await getModalitaPagamento()
    return NextResponse.json(modalita)
  } catch (error) {
    console.error("Error fetching modalita pagamento:", error)
    return NextResponse.json({ error: "Failed to fetch modalita pagamento" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: ModalitaPagamentoInput = await request.json()

    if (!body.codice || !body.descrizione) {
      return NextResponse.json({ error: "codice and descrizione are required" }, { status: 400 })
    }

    const modalita = await createModalitaPagamento({
      codice: body.codice,
      descrizione: body.descrizione,
      giorni_scadenza: body.giorni_scadenza || 0,
      is_attiva: body.is_attiva ?? true,
    })

    return NextResponse.json(modalita, { status: 201 })
  } catch (error) {
    console.error("Error creating modalita pagamento:", error)
    return NextResponse.json({ error: "Failed to create modalita pagamento" }, { status: 500 })
  }
}
