import { NextResponse } from "next/server"
import {
  getFatturaById,
  getRigheFattura,
  getScadenzeByFattura,
  updateFattura,
  deleteFattura,
  deleteRigheFattura,
  deleteScadenzeByFattura,
  createRigaFattura,
  createScadenza,
  type FatturaInput,
  type RigaFatturaInput,
} from "@/lib/db"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const fattura = await getFatturaById(Number(id))

    if (!fattura) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    const [righe, scadenze] = await Promise.all([
      getRigheFattura(fattura.id),
      getScadenzeByFattura(fattura.id),
    ])

    return NextResponse.json({ ...fattura, righe, scadenze })
  } catch (error) {
    console.error("Error fetching fattura:", error)
    return NextResponse.json({ error: "Failed to fetch fattura" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { righe, scadenze, ...fatturaData } = body

    const fattura = await updateFattura(Number(id), {
      numero_fattura: fatturaData.numero_fattura,
      data_documento: fatturaData.data_documento,
      cliente_id: fatturaData.cliente_id,
      rif_bolla_numero: fatturaData.rif_bolla_numero || null,
      rif_bolla_data: fatturaData.rif_bolla_data || null,
      descrizione_pagamento: fatturaData.descrizione_pagamento || null,
      iban: fatturaData.iban || null,
      modalita_pagamento_id: fatturaData.modalita_pagamento_id || null,
      note: fatturaData.note || null,
      spese_incasso: fatturaData.spese_incasso || 0,
      sconto_percentuale: fatturaData.sconto_percentuale || 0,
      totale_merce: fatturaData.totale_merce || 0,
      totale_imponibile: fatturaData.totale_imponibile || 0,
      totale_imposta: fatturaData.totale_imposta || 0,
      totale_fattura: fatturaData.totale_fattura || 0,
      acconto: fatturaData.acconto || 0,
      stato: fatturaData.stato || "bozza",
    } as FatturaInput)

    if (!fattura) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    // Replace righe
    await deleteRigheFattura(fattura.id)
    if (righe && Array.isArray(righe)) {
      for (let i = 0; i < righe.length; i++) {
        const riga = righe[i]
        await createRigaFattura({
          fattura_id: fattura.id,
          posizione: i + 1,
          descrizione: riga.descrizione || "",
          quantita: riga.quantita || 0,
          prezzo_unitario: riga.prezzo_unitario || 0,
          percentuale_iva: riga.percentuale_iva || 0,
          aliquota_iva_id: riga.aliquota_iva_id || null,
          importo_netto: riga.importo_netto || 0,
          importo_iva: riga.importo_iva || 0,
          importo_totale: riga.importo_totale || 0,
        } as RigaFatturaInput)
      }
    }

    // Replace scadenze
    await deleteScadenzeByFattura(fattura.id)
    if (scadenze && Array.isArray(scadenze)) {
      for (const scadenza of scadenze) {
        await createScadenza({
          fattura_id: fattura.id,
          numero_rata: scadenza.numero_rata || 1,
          data_scadenza: scadenza.data_scadenza,
          importo: scadenza.importo || 0,
          stato: scadenza.stato || "da_pagare",
          data_pagamento: scadenza.data_pagamento || null,
          note: scadenza.note || null,
        })
      }
    }

    return NextResponse.json(fattura)
  } catch (error) {
    console.error("Error updating fattura:", error)
    return NextResponse.json({ error: "Failed to update fattura" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteFattura(Number(id))

    if (!deleted) {
      return NextResponse.json({ error: "Fattura not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting fattura:", error)
    return NextResponse.json({ error: "Failed to delete fattura" }, { status: 500 })
  }
}
