import { NextResponse } from "next/server"
import { getInvoiceById, updateInvoice, deleteInvoice } from "@/lib/db"

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

    const invoice = await getInvoiceById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
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
    const invoice = await updateInvoice(invoiceId, body)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoiceId = parseInt(id, 10)

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    const deleted = await deleteInvoice(invoiceId)

    if (!deleted) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
