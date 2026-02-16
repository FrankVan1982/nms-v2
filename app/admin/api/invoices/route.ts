import { NextResponse } from "next/server"
import { getInvoices, createInvoice, getNextInvoiceNumber, type InvoiceInput } from "@/lib/db"

export async function GET() {
  try {
    const invoices = await getInvoices()
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
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

    const invoiceNumber = body.invoice_number || await getNextInvoiceNumber()

    const invoice = await createInvoice({
      client_id: body.client_id,
      invoice_number: invoiceNumber,
      invoice_date: body.invoice_date || new Date().toISOString().split("T")[0],
      payment_description: body.payment_description || null,
      client_unique_code: body.client_unique_code || null,
      ref_bolla_number: body.ref_bolla_number || null,
      ref_bolla_date: body.ref_bolla_date || null,
      total_merce: body.total_merce || 0,
      discount_percent: body.discount_percent || 0,
      spese_incasso: body.spese_incasso || 0,
      total_imponibile: body.total_imponibile || 0,
      total_imposta: body.total_imposta || 0,
      total: body.total || 0,
      scadenziario: body.scadenziario || null,
      acconto: body.acconto || 0,
      notes: body.notes || null,
    } as InvoiceInput)

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
