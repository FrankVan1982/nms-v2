import { NextResponse } from "next/server"
import { getDDTItems, replaceDDTItems } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ddtId = parseInt(id, 10)

    if (isNaN(ddtId)) {
      return NextResponse.json({ error: "Invalid DDT ID" }, { status: 400 })
    }

    const items = await getDDTItems(ddtId)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching DDT items:", error)
    return NextResponse.json({ error: "Failed to fetch DDT items" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ddtId = parseInt(id, 10)

    if (isNaN(ddtId)) {
      return NextResponse.json({ error: "Invalid DDT ID" }, { status: 400 })
    }

    const body = await request.json()
    const items = Array.isArray(body) ? body : body.items || []

    const created = await replaceDDTItems(ddtId, items)
    return NextResponse.json(created)
  } catch (error) {
    console.error("Error replacing DDT items:", error)
    return NextResponse.json({ error: "Failed to replace DDT items" }, { status: 500 })
  }
}
