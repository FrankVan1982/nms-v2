import { NextResponse } from "next/server"
import { getDDTById, updateDDT, deleteDDT } from "@/lib/db"

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

    const ddt = await getDDTById(ddtId)

    if (!ddt) {
      return NextResponse.json({ error: "DDT not found" }, { status: 404 })
    }

    return NextResponse.json(ddt)
  } catch (error) {
    console.error("Error fetching DDT:", error)
    return NextResponse.json({ error: "Failed to fetch DDT" }, { status: 500 })
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
    const ddt = await updateDDT(ddtId, body)

    if (!ddt) {
      return NextResponse.json({ error: "DDT not found" }, { status: 404 })
    }

    return NextResponse.json(ddt)
  } catch (error) {
    console.error("Error updating DDT:", error)
    return NextResponse.json({ error: "Failed to update DDT" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ddtId = parseInt(id, 10)

    if (isNaN(ddtId)) {
      return NextResponse.json({ error: "Invalid DDT ID" }, { status: 400 })
    }

    const deleted = await deleteDDT(ddtId)

    if (!deleted) {
      return NextResponse.json({ error: "DDT not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting DDT:", error)
    return NextResponse.json({ error: "Failed to delete DDT" }, { status: 500 })
  }
}
