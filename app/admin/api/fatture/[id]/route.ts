import { NextResponse } from "next/server"
import { getFatturaConRighe, updateFattura, deleteFattura, type FatturaInput } from "@/lib/db"

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

    const body: Partial<FatturaInput> = await request.json()

    const fattura = await updateFattura(fatturaId, body)

    if (!fattura) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
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
