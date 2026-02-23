import { NextResponse } from "next/server"
import { getAliquoteIva, createAliquotaIva, type AliquotaIvaInput } from "@/lib/db"

export async function GET() {
  try {
    const aliquote = await getAliquoteIva()
    return NextResponse.json(aliquote)
  } catch (error) {
    console.error("Error fetching aliquote IVA:", error)
    return NextResponse.json({ error: "Failed to fetch aliquote IVA" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: AliquotaIvaInput = await request.json()

    if (!body.descrizione || body.percentuale === undefined) {
      return NextResponse.json({ error: "descrizione and percentuale are required" }, { status: 400 })
    }

    const aliquota = await createAliquotaIva({
      descrizione: body.descrizione,
      percentuale: body.percentuale,
      is_attiva: body.is_attiva ?? true,
    })

    return NextResponse.json(aliquota, { status: 201 })
  } catch (error) {
    console.error("Error creating aliquota IVA:", error)
    return NextResponse.json({ error: "Failed to create aliquota IVA" }, { status: 500 })
  }
}
