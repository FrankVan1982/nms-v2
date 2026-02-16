import { NextResponse } from "next/server"
import { getDDTs, createDDT, getNextDDTNumber, type DDTInput } from "@/lib/db"

export async function GET() {
  try {
    const ddts = await getDDTs()
    return NextResponse.json(ddts)
  } catch (error) {
    console.error("Error fetching DDTs:", error)
    return NextResponse.json({ error: "Failed to fetch DDTs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.client_id) {
      return NextResponse.json(
        { error: "client_id is required" },
        { status: 400 }
      )
    }

    const ddtNumber = body.ddt_number || await getNextDDTNumber()

    const ddt = await createDDT({
      client_id: body.client_id,
      ddt_number: ddtNumber,
      ddt_date: body.ddt_date || new Date().toISOString().split("T")[0],
      client_fiscal_code: body.client_fiscal_code || null,
      payment_conditions: body.payment_conditions || null,
      aspetto_beni: body.aspetto_beni || null,
      n_colli: body.n_colli || null,
      peso_lordo: body.peso_lordo || null,
      peso_netto: body.peso_netto || null,
      porto: body.porto || null,
      causale_trasporto: body.causale_trasporto || null,
      mezzo_trasporto: body.mezzo_trasporto || null,
      data_ora_trasporto: body.data_ora_trasporto || null,
      notes: body.notes || null,
    } as DDTInput)

    return NextResponse.json(ddt, { status: 201 })
  } catch (error) {
    console.error("Error creating DDT:", error)
    return NextResponse.json({ error: "Failed to create DDT" }, { status: 500 })
  }
}
