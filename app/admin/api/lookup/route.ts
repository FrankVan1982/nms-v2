import { NextResponse } from "next/server"
import { getAliquoteIva, getModalitaPagamento, getClients } from "@/lib/db"

export async function GET() {
  try {
    const [aliquoteIva, modalitaPagamento, clienti] = await Promise.all([
      getAliquoteIva(),
      getModalitaPagamento(),
      getClients()
    ])

    return NextResponse.json({
      aliquoteIva,
      modalitaPagamento,
      clienti: clienti.map(c => ({ id: c.id, ragione_sociale: c.ragione_sociale }))
    })
  } catch (error) {
    console.error("Error fetching lookup data:", error)
    return NextResponse.json({ error: "Failed to fetch lookup data" }, { status: 500 })
  }
}
