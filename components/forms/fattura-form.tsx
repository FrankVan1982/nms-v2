"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import type { Client, AliquotaIva, ModalitaPagamento, Fattura, RigaFattura } from "@/lib/db"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Loader2, Calculator, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface RigaFormData {
  id?: number
  posizione: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  aliquota_iva_id: number | null
  percentuale_iva: number
}

interface FatturaFormData {
  numero_fattura: string
  data_documento: string
  cliente_id: number | null
  rif_bolla_numero: string
  rif_bolla_data: string
  modalita_pagamento_id: number | null
  descrizione_pagamento: string
  iban: string
  sconto_percentuale: number
  spese_incasso: number
  acconto: number
  stato: string
  note: string
}

interface FatturaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fattura?: Fattura | null
  righe?: RigaFattura[]
  onSubmit: (data: FatturaFormData, righe: RigaFormData[]) => Promise<void>
  isLoading?: boolean
}

const defaultRiga: RigaFormData = {
  posizione: 1,
  descrizione: "",
  quantita: 1,
  prezzo_unitario: 0,
  aliquota_iva_id: null,
  percentuale_iva: 22,
}

const defaultFormData: FatturaFormData = {
  numero_fattura: "",
  data_documento: new Date().toISOString().split("T")[0],
  cliente_id: null,
  rif_bolla_numero: "",
  rif_bolla_data: "",
  modalita_pagamento_id: null,
  descrizione_pagamento: "",
  iban: "",
  sconto_percentuale: 0,
  spese_incasso: 0,
  acconto: 0,
  stato: "bozza",
  note: "",
}

export function FatturaForm({
  open,
  onOpenChange,
  fattura,
  righe: existingRighe,
  onSubmit,
  isLoading = false,
}: FatturaFormProps) {
  const [formData, setFormData] = useState<FatturaFormData>(defaultFormData)
  const [righe, setRighe] = useState<RigaFormData[]>([{ ...defaultRiga }])

  // Fetch lookup data
  const { data: lookupData } = useSWR<{
    clienti: Client[]
    aliquoteIva: AliquotaIva[]
    modalitaPagamento: ModalitaPagamento[]
  }>(open ? "/admin/api/lookup" : null, fetcher)

  const clienti = lookupData?.clienti || []
  const aliquoteIva = lookupData?.aliquoteIva || []
  const modalitaPagamento = lookupData?.modalitaPagamento || []

  // Reset form when dialog opens/closes or fattura changes
  useEffect(() => {
    console.log("[v0] FatturaForm useEffect triggered", { open, fattura: fattura?.id, existingRigheCount: existingRighe?.length })
    if (open) {
      if (fattura) {
        console.log("[v0] Setting form data for fattura:", fattura.numero_fattura)
        setFormData({
          numero_fattura: fattura.numero_fattura,
          data_documento: fattura.data_documento.split("T")[0],
          cliente_id: fattura.cliente_id,
          rif_bolla_numero: fattura.rif_bolla_numero || "",
          rif_bolla_data: fattura.rif_bolla_data?.split("T")[0] || "",
          modalita_pagamento_id: fattura.modalita_pagamento_id,
          descrizione_pagamento: fattura.descrizione_pagamento || "",
          iban: fattura.iban || "",
          sconto_percentuale: fattura.sconto_percentuale || 0,
          spese_incasso: fattura.spese_incasso || 0,
          acconto: fattura.acconto || 0,
          stato: fattura.stato,
          note: fattura.note || "",
        })
        if (existingRighe && existingRighe.length > 0) {
          console.log("[v0] Setting righe:", existingRighe.map(r => ({ id: r.id, desc: r.descrizione, qty: r.quantita, price: r.prezzo_unitario })))
          setRighe(
            existingRighe.map((r) => ({
              id: r.id,
              posizione: r.posizione,
              descrizione: r.descrizione,
              quantita: Number(r.quantita),
              prezzo_unitario: Number(r.prezzo_unitario),
              aliquota_iva_id: r.aliquota_iva_id,
              percentuale_iva: Number(r.percentuale_iva),
            }))
          )
        } else {
          console.log("[v0] No existing righe, keeping default")
          setRighe([{ ...defaultRiga }])
        }
      } else {
        console.log("[v0] No fattura, resetting to defaults")
        setFormData(defaultFormData)
        setRighe([{ ...defaultRiga }])
      }
    }
  }, [open, fattura, existingRighe])

  // Auto-set IVA percentage when aliquota changes
  const handleAliquotaChange = (index: number, aliquotaId: string) => {
    const aliquota = aliquoteIva.find((a) => a.id === parseInt(aliquotaId))
    updateRiga(index, {
      aliquota_iva_id: parseInt(aliquotaId),
      percentuale_iva: aliquota?.percentuale || 22,
    })
  }

  // Calculate totals
  const totals = useMemo(() => {
    let totaleMerce = 0
    let totaleIva = 0

    righe.forEach((riga) => {
      const imponibile = riga.quantita * riga.prezzo_unitario
      const iva = imponibile * (riga.percentuale_iva / 100)
      totaleMerce += imponibile
      totaleIva += iva
    })

    // Apply discount
    const scontoAmount = totaleMerce * (formData.sconto_percentuale / 100)
    const imponibileScontato = totaleMerce - scontoAmount

    // Recalculate IVA on discounted amount
    const ivaDopoSconto = righe.reduce((acc, riga) => {
      const imponibileRiga = riga.quantita * riga.prezzo_unitario
      const proporzione = totaleMerce > 0 ? imponibileRiga / totaleMerce : 0
      const imponibileScontatoRiga = imponibileRiga - scontoAmount * proporzione
      return acc + imponibileScontatoRiga * (riga.percentuale_iva / 100)
    }, 0)

    const totaleConIva = imponibileScontato + ivaDopoSconto + formData.spese_incasso
    const daPagare = totaleConIva - formData.acconto

    return {
      totaleMerce,
      sconto: scontoAmount,
      imponibile: imponibileScontato,
      iva: ivaDopoSconto,
      speseIncasso: formData.spese_incasso,
      totale: totaleConIva,
      acconto: formData.acconto,
      daPagare: Math.max(0, daPagare),
    }
  }, [righe, formData.sconto_percentuale, formData.spese_incasso, formData.acconto])

  const updateRiga = (index: number, updates: Partial<RigaFormData>) => {
    setRighe((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    )
  }

  const addRiga = () => {
    setRighe((prev) => [
      ...prev,
      { ...defaultRiga, posizione: prev.length + 1 },
    ])
  }

  const removeRiga = (index: number) => {
    if (righe.length > 1) {
      setRighe((prev) =>
        prev
          .filter((_, i) => i !== index)
          .map((r, i) => ({ ...r, posizione: i + 1 }))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cliente_id || !formData.numero_fattura) return
    await onSubmit(formData, righe)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const selectedCliente = clienti.find((c) => c.id === formData.cliente_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fattura ? "Modifica Fattura" : "Nuova Fattura"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header: Numero, Data, Cliente */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="numero_fattura">Numero Fattura *</Label>
              <Input
                id="numero_fattura"
                value={formData.numero_fattura}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numero_fattura: e.target.value,
                  }))
                }
                placeholder="es. FT-2026/001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_documento">Data Documento *</Label>
              <Input
                id="data_documento"
                type="date"
                value={formData.data_documento}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    data_documento: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stato">Stato</Label>
              <Select
                value={formData.stato}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, stato: value }))
                }
              >
                <SelectTrigger id="stato">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bozza">Bozza</SelectItem>
                  <SelectItem value="emessa">Emessa</SelectItem>
                  <SelectItem value="inviata">Inviata</SelectItem>
                  <SelectItem value="pagata">Pagata</SelectItem>
                  <SelectItem value="parziale">Parziale</SelectItem>
                  <SelectItem value="scaduta">Scaduta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cliente Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cliente *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.cliente_id?.toString() || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    cliente_id: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clienti.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.ragione_sociale}
                      {cliente.partita_iva && ` - P.IVA: ${cliente.partita_iva}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCliente && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                  <p className="font-medium">{selectedCliente.ragione_sociale}</p>
                  {selectedCliente.indirizzo && (
                    <p className="text-muted-foreground">
                      {selectedCliente.indirizzo}
                      {selectedCliente.cap && `, ${selectedCliente.cap}`}
                      {selectedCliente.citta && ` ${selectedCliente.citta}`}
                      {selectedCliente.provincia && ` (${selectedCliente.provincia})`}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    {selectedCliente.partita_iva && (
                      <span>P.IVA: {selectedCliente.partita_iva}</span>
                    )}
                    {selectedCliente.codice_fiscale && (
                      <span>C.F.: {selectedCliente.codice_fiscale}</span>
                    )}
                    {selectedCliente.codice_univoco && (
                      <span>SDI: {selectedCliente.codice_univoco}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Riferimenti Bolla */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rif_bolla_numero">Rif. Bolla Numero</Label>
              <Input
                id="rif_bolla_numero"
                value={formData.rif_bolla_numero}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rif_bolla_numero: e.target.value,
                  }))
                }
                placeholder="es. DDT-2026/001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rif_bolla_data">Rif. Bolla Data</Label>
              <Input
                id="rif_bolla_data"
                type="date"
                value={formData.rif_bolla_data}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rif_bolla_data: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Righe Fattura */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Righe Fattura</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addRiga}>
                  <Plus className="mr-1 h-4 w-4" />
                  Aggiungi Riga
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                <div className="col-span-5">Descrizione</div>
                <div className="col-span-2 text-right">Quantita</div>
                <div className="col-span-2 text-right">Prezzo Unit.</div>
                <div className="col-span-2">IVA</div>
                <div className="col-span-1"></div>
              </div>

              {righe.map((riga, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-12 items-start p-2 rounded-lg bg-muted/30"
                >
                  {/* Descrizione */}
                  <div className="md:col-span-5">
                    <Label className="md:hidden text-xs">Descrizione</Label>
                    <Textarea
                      value={riga.descrizione}
                      onChange={(e) =>
                        updateRiga(index, { descrizione: e.target.value })
                      }
                      placeholder="Descrizione articolo/servizio"
                      className="min-h-[60px] resize-none"
                    />
                  </div>

                  {/* Quantita */}
                  <div className="md:col-span-2">
                    <Label className="md:hidden text-xs">Quantita</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={riga.quantita}
                      onChange={(e) =>
                        updateRiga(index, {
                          quantita: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-right"
                    />
                  </div>

                  {/* Prezzo Unitario */}
                  <div className="md:col-span-2">
                    <Label className="md:hidden text-xs">Prezzo Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={riga.prezzo_unitario}
                      onChange={(e) =>
                        updateRiga(index, {
                          prezzo_unitario: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-right"
                    />
                  </div>

                  {/* IVA */}
                  <div className="md:col-span-2">
                    <Label className="md:hidden text-xs">IVA</Label>
                    <Select
                      value={riga.aliquota_iva_id?.toString() || ""}
                      onValueChange={(value) => handleAliquotaChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        {aliquoteIva.map((aliquota) => (
                          <SelectItem
                            key={aliquota.id}
                            value={aliquota.id.toString()}
                          >
                            {aliquota.percentuale}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove button */}
                  <div className="md:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRiga(index)}
                      disabled={righe.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Line total */}
                  <div className="md:col-span-12 text-right text-sm text-muted-foreground">
                    Totale riga:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        riga.quantita *
                          riga.prezzo_unitario *
                          (1 + riga.percentuale_iva / 100)
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pagamento e Sconti */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modalita_pagamento">Modalita Pagamento</Label>
                  <Select
                    value={formData.modalita_pagamento_id?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        modalita_pagamento_id: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger id="modalita_pagamento">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {modalitaPagamento.map((mp) => (
                        <SelectItem key={mp.id} value={mp.id.toString()}>
                          {mp.descrizione}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descrizione_pagamento">
                    Descrizione Pagamento
                  </Label>
                  <Input
                    id="descrizione_pagamento"
                    value={formData.descrizione_pagamento}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descrizione_pagamento: e.target.value,
                      }))
                    }
                    placeholder="es. Bonifico bancario 30gg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, iban: e.target.value }))
                    }
                    placeholder="IT00X0000000000000000000000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sconti e Spese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sconto_percentuale">Sconto %</Label>
                  <Input
                    id="sconto_percentuale"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.sconto_percentuale}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sconto_percentuale: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spese_incasso">Spese Incasso</Label>
                  <Input
                    id="spese_incasso"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.spese_incasso}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        spese_incasso: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acconto">Acconto</Label>
                  <Input
                    id="acconto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.acconto}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        acconto: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Note aggiuntive..."
              className="min-h-[80px]"
            />
          </div>

          <Separator />

          {/* Totals */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Riepilogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totale Merce:</span>
                  <span>{formatCurrency(totals.totaleMerce)}</span>
                </div>
                {totals.sconto > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Sconto ({formData.sconto_percentuale}%):</span>
                    <span>-{formatCurrency(totals.sconto)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imponibile:</span>
                  <span>{formatCurrency(totals.imponibile)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA:</span>
                  <span>{formatCurrency(totals.iva)}</span>
                </div>
                {totals.speseIncasso > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spese Incasso:</span>
                    <span>{formatCurrency(totals.speseIncasso)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Totale Fattura:</span>
                  <span>{formatCurrency(totals.totale)}</span>
                </div>
                {totals.acconto > 0 && (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Acconto:</span>
                      <span>-{formatCurrency(totals.acconto)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Da Pagare:</span>
                      <span>{formatCurrency(totals.daPagare)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.cliente_id || !formData.numero_fattura}
              className={cn(isLoading && "opacity-70")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : fattura ? (
                "Aggiorna Fattura"
              ) : (
                "Crea Fattura"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
