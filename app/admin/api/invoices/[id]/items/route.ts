import { NextResponse } from "next/server"
import { getInvoiceItems, replaceInvoiceItems } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoiceId = parseInt(id, 10)

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    const items = await getInvoiceItems(invoiceId)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching invoice items:", error)
    return NextResponse.json({ error: "Failed to fetch invoice items" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoiceId = parseInt(id, 10)

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    const body = await request.json()
    const items = Array.isArray(body) ? body : body.items || []

    const created = await replaceInvoiceItems(invoiceId, items)
    return NextResponse.json(created)
  } catch (error) {
    console.error("Error replacing invoice items:", error)
    return NextResponse.json({ error: "Failed to replace invoice items" }, { status: 500 })
  }
}
