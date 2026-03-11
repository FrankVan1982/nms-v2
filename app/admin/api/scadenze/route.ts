import { NextResponse } from "next/server"
import { getScadenzePendenti } from "@/lib/db"

export async function GET() {
  try {
    const scadenze = await getScadenzePendenti()
    return NextResponse.json(scadenze)
  } catch (error) {
    console.error("Error fetching scadenze:", error)
    return NextResponse.json({ error: "Failed to fetch scadenze" }, { status: 500 })
  }
}
