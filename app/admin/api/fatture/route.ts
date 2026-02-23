import { NextResponse } from "next/server"
import {
  getFattureComplete,
  createFattura,
  createRigaFattura,
  createScadenza,
  deleteRigheFattura,
  deleteScadenzeByFattura,
  type FatturaInput,
  type RigaFatturaInput,
} from "@/lib/db"

export async function GET() {
  try {
    const fatture = await getFattureComplete()
    return NextResponse.json(fatture)
  } catch (error) {
    console.error("Error fetching fatture:", error)
    return NextResponse.json({ error: "Failed to fetch fatture" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { righe, scadenze, ...fatturaData } = body

    if (!fatturaData.numero_fattura || !fatturaData.data_documento || !fatturaData.cliente_id) {
      return NextResponse.json(
        { error: "numero_fattura, data_documento, and cliente_id are required" },
        { status: 400 }
      )
    }

    const fattura = await createFattura({
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

    // Create righe
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

    // Create scadenze
    if (scadenze && Array.isArray(scadenze)) {
      for (const scadenza of scadenze) {
        await createScadenza({
          fattura_id: fattura.id,
          numero_rata: scadenza.numero_rata || 1,
          data_scadenza: scadenza.data_scadenza,
          importo: scadenza.importo || 0,
          stato: "da_pagare",
          data_pagamento: null,
          note: null,
        })
      }
    }

    return NextResponse.json(fattura, { status: 201 })
  } catch (error) {
    console.error("Error creating fattura:", error)
    return NextResponse.json({ error: "Failed to create fattura" }, { status: 500 })
  }
}
