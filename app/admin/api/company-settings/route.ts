import { NextResponse } from "next/server"
import { getCompanySettings, upsertCompanySettings, type CompanySettingsInput } from "@/lib/db"

export async function GET() {
  try {
    const settings = await getCompanySettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching company settings:", error)
    return NextResponse.json({ error: "Failed to fetch company settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body: CompanySettingsInput = await request.json()

    if (!body.company_name) {
      return NextResponse.json(
        { error: "company_name is required" },
        { status: 400 }
      )
    }

    const settings = await upsertCompanySettings({
      company_name: body.company_name,
      legal_address: body.legal_address || null,
      office_address: body.office_address || null,
      phone: body.phone || null,
      mobile: body.mobile || null,
      email: body.email || null,
      pec: body.pec || null,
      cciaa_registration: body.cciaa_registration || null,
      vat_number: body.vat_number || null,
      fiscal_code: body.fiscal_code || null,
      iban: body.iban || null,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving company settings:", error)
    return NextResponse.json({ error: "Failed to save company settings" }, { status: 500 })
  }
}
