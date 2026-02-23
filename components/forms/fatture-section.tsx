"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import type { FatturaCompleta, Client, AliquotaIva, ModalitaPagamento } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Trash2, FileText, Search, Loader2, MoreHorizontal, Pencil, FileDown } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCurrency(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n)
}

function formatDate(d: string) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("it-IT")
}

function statoBadge(stato: string) {
  const map: Record<string, { className: string; label: string }> = {
    bozza: { className: "bg-muted text-muted-foreground", label: "Bozza" },
    emessa: { className: "bg-blue-500/10 text-blue-600", label: "Emessa" },
    pagata: { className: "bg-emerald-500/10 text-emerald-600", label: "Pagata" },
    annullata: { className: "bg-destructive/10 text-destructive", label: "Annullata" },
  }
  const b = map[stato] || map.bozza
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${b.className}`}>{b.label}</span>
}

interface RigaLocal {
  key: string
  descrizione: string
  quantita: number
  prezzo_unitario: number
  aliquota_iva_id: number | null
  percentuale_iva: number
  importo_netto: number
  importo_iva: number
  importo_totale: number
}

function newRiga(): RigaLocal {
  return {
    key: Math.random().toString(36).substring(7),
    descrizione: "",
    quantita: 1,
    prezzo_unitario: 0,
    aliquota_iva_id: null,
    percentuale_iva: 0,
    importo_netto: 0,
    importo_iva: 0,
    importo_totale: 0,
  }
}

export function FattureSection() {
  const { data: fatture, mutate: mutateFatture } = useSWR<FatturaCompleta[]>("/admin/api/fatture", fetcher)
  const { data: clienti } = useSWR<Client[]>("/admin/api/clients", fetcher)
  const { data: aliquote } = useSWR<AliquotaIva[]>("/admin/api/aliquote-iva", fetcher)
  const { data: modalitaPag } = useSWR<ModalitaPagamento[]>("/admin/api/modalita-pagamento", fetcher)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStato, setFilterStato] = useState<string>("tutti")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FatturaCompleta | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [numeroFattura, setNumeroFattura] = useState("")
  const [dataDocumento, setDataDocumento] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [rifBollaNumero, setRifBollaNumero] = useState("")
  const [rifBollaData, setRifBollaData] = useState("")
  const [descrizionePagamento, setDescrizionePagamento] = useState("")
  const [iban, setIban] = useState("")
  const [modalitaPagamentoId, setModalitaPagamentoId] = useState("")
  const [note, setNote] = useState("")
  const [speseIncasso, setSpeseIncasso] = useState(0)
  const [scontoPercentuale, setScontoPercentuale] = useState(0)
  const [acconto, setAcconto] = useState(0)
  const [stato, setStato] = useState("bozza")
  const [righe, setRighe] = useState<RigaLocal[]>([newRiga()])

  // Computed totals
  const [totaleMerce, setTotaleMerce] = useState(0)
  const [totaleImponibile, setTotaleImponibile] = useState(0)
  const [totaleImposta, setTotaleImposta] = useState(0)
  const [totaleFattura, setTotaleFattura] = useState(0)

  const recalcTotals = useCallback(() => {
    const merce = righe.reduce((sum, r) => sum + r.importo_netto, 0)
    const scontoAmount = merce * (scontoPercentuale / 100)
    const imponibile = merce - scontoAmount + speseIncasso
    // Scale imposta relative to sconto
    const rawImposta = righe.reduce((sum, r) => sum + r.importo_iva, 0)
    const imposta = merce > 0 ? rawImposta * ((merce - scontoAmount) / merce) : 0
    const totale = imponibile + imposta

    setTotaleMerce(Math.round(merce * 100) / 100)
    setTotaleImponibile(Math.round(imponibile * 100) / 100)
    setTotaleImposta(Math.round(imposta * 100) / 100)
    setTotaleFattura(Math.round(totale * 100) / 100)
  }, [righe, scontoPercentuale, speseIncasso])

  useEffect(() => {
    recalcTotals()
  }, [recalcTotals])

  const updateRiga = (key: string, field: string, value: string | number) => {
    setRighe((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r
        const updated = { ...r, [field]: value }

        if (field === "aliquota_iva_id" && aliquote) {
          const aliquota = aliquote.find((a) => a.id === Number(value))
          if (aliquota) updated.percentuale_iva = aliquota.percentuale
        }

        // Recalc row
        if (["quantita", "prezzo_unitario", "percentuale_iva", "aliquota_iva_id"].includes(field)) {
          updated.importo_netto = Math.round(updated.quantita * updated.prezzo_unitario * 100) / 100
          updated.importo_iva = Math.round(updated.importo_netto * (updated.percentuale_iva / 100) * 100) / 100
          updated.importo_totale = Math.round((updated.importo_netto + updated.importo_iva) * 100) / 100
        }

        return updated
      })
    )
  }

  const removeRiga = (key: string) => {
    setRighe((prev) => prev.filter((r) => r.key !== key))
  }

  const resetForm = () => {
    setNumeroFattura("")
    setDataDocumento("")
    setClienteId("")
    setRifBollaNumero("")
    setRifBollaData("")
    setDescrizionePagamento("")
    setIban("")
    setModalitaPagamentoId("")
    setNote("")
    setSpeseIncasso(0)
    setScontoPercentuale(0)
    setAcconto(0)
    setStato("bozza")
    setRighe([newRiga()])
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEdit = async (fatturaId: number) => {
    try {
      const res = await fetch(`/admin/api/fatture/${fatturaId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()

      setEditingId(fatturaId)
      setNumeroFattura(data.numero_fattura || "")
      setDataDocumento(data.data_documento || "")
      setClienteId(String(data.cliente_id || ""))
      setRifBollaNumero(data.rif_bolla_numero || "")
      setRifBollaData(data.rif_bolla_data || "")
      setDescrizionePagamento(data.descrizione_pagamento || "")
      setIban(data.iban || "")
      setModalitaPagamentoId(String(data.modalita_pagamento_id || ""))
      setNote(data.note || "")
      setSpeseIncasso(Number(data.spese_incasso) || 0)
      setScontoPercentuale(Number(data.sconto_percentuale) || 0)
      setAcconto(Number(data.acconto) || 0)
      setStato(data.stato || "bozza")

      if (data.righe && data.righe.length > 0) {
        setRighe(
          data.righe.map((r: Record<string, unknown>) => ({
            key: Math.random().toString(36).substring(7),
            descrizione: r.descrizione || "",
            quantita: Number(r.quantita) || 0,
            prezzo_unitario: Number(r.prezzo_unitario) || 0,
            aliquota_iva_id: r.aliquota_iva_id ? Number(r.aliquota_iva_id) : null,
            percentuale_iva: Number(r.percentuale_iva) || 0,
            importo_netto: Number(r.importo_netto) || 0,
            importo_iva: Number(r.importo_iva) || 0,
            importo_totale: Number(r.importo_totale) || 0,
          }))
        )
      } else {
        setRighe([newRiga()])
      }

      setFormOpen(true)
    } catch {
      toast.error("Errore nel caricamento della fattura")
    }
  }

  const handleSubmit = async () => {
    if (!numeroFattura || !dataDocumento || !clienteId) {
      toast.error("Compila i campi obbligatori: numero fattura, data e cliente")
      return
    }
    setIsSubmitting(true)

    // Build scadenze from modalita pagamento
    const scadenze: { numero_rata: number; data_scadenza: string; importo: number }[] = []
    if (modalitaPagamentoId && modalitaPag) {
      const mod = modalitaPag.find((m) => m.id === Number(modalitaPagamentoId))
      if (mod) {
        const daPagare = totaleFattura - acconto
        if (daPagare > 0) {
          const scadDate = new Date(dataDocumento)
          scadDate.setDate(scadDate.getDate() + mod.giorni_scadenza)
          scadenze.push({
            numero_rata: 1,
            data_scadenza: scadDate.toISOString().split("T")[0],
            importo: Math.round(daPagare * 100) / 100,
          })
        }
      }
    }

    const payload = {
      numero_fattura: numeroFattura,
      data_documento: dataDocumento,
      cliente_id: Number(clienteId),
      rif_bolla_numero: rifBollaNumero || null,
      rif_bolla_data: rifBollaData || null,
      descrizione_pagamento: descrizionePagamento || null,
      iban: iban || null,
      modalita_pagamento_id: modalitaPagamentoId ? Number(modalitaPagamentoId) : null,
      note: note || null,
      spese_incasso: speseIncasso,
      sconto_percentuale: scontoPercentuale,
      totale_merce: totaleMerce,
      totale_imponibile: totaleImponibile,
      totale_imposta: totaleImposta,
      totale_fattura: totaleFattura,
      acconto,
      stato,
      righe: righe.filter((r) => r.descrizione).map((r) => ({
        descrizione: r.descrizione,
        quantita: r.quantita,
        prezzo_unitario: r.prezzo_unitario,
        percentuale_iva: r.percentuale_iva,
        aliquota_iva_id: r.aliquota_iva_id,
        importo_netto: r.importo_netto,
        importo_iva: r.importo_iva,
        importo_totale: r.importo_totale,
      })),
      scadenze,
    }

    try {
      const url = editingId ? `/admin/api/fatture/${editingId}` : "/admin/api/fatture"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      toast.success(editingId ? "Fattura aggiornata" : "Fattura creata")
      setFormOpen(false)
      resetForm()
      mutateFatture()
    } catch {
      toast.error("Errore nel salvataggio della fattura")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/admin/api/fatture/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Fattura eliminata")
      setDeleteTarget(null)
      mutateFatture()
    } catch {
      toast.error("Errore nell'eliminazione")
    }
  }

  const handleExport = async (fatturaId: number, clienteId: number) => {
    try {
      const res = await fetch(`/admin/api/clients/${clienteId}/export?type=fattura&fattura_id=${fatturaId}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "fattura.docx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Fattura esportata")
    } catch {
      toast.error("Errore nell'esportazione")
    }
  }

  const filteredFatture = (fatture || []).filter((f) => {
    const matchSearch = f.numero_fattura.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ragione_sociale.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStato = filterStato === "tutti" || f.stato === filterStato
    return matchSearch && matchStato
  })

  // Get selected modalita info for scadenza preview
  const selectedModalita = modalitaPag?.find((m) => m.id === Number(modalitaPagamentoId))
  const daPagare = totaleFattura - acconto
  const dataScadenza = dataDocumento && selectedModalita
    ? (() => { const d = new Date(dataDocumento); d.setDate(d.getDate() + selectedModalita.giorni_scadenza); return d.toLocaleDateString("it-IT") })()
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fatture</h2>
          <p className="text-sm text-muted-foreground">Gestisci le fatture e le righe associate</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Fattura
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per numero fattura o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="tutti">Tutti</SelectItem>
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="emessa">Emessa</SelectItem>
            <SelectItem value="pagata">Pagata</SelectItem>
            <SelectItem value="annullata">Annullata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">N. Fattura</TableHead>
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground text-right">Totale</TableHead>
              <TableHead className="text-muted-foreground text-right">Da Pagare</TableHead>
              <TableHead className="text-muted-foreground">Stato</TableHead>
              <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFatture.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p>Nessuna fattura trovata</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFatture.map((f) => (
                <TableRow key={f.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm font-medium">{f.numero_fattura}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(f.data_documento)}</TableCell>
                  <TableCell className="font-medium">{f.ragione_sociale}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(f.totale_fattura)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(f.da_pagare)}</TableCell>
                  <TableCell>{statoBadge(f.stato)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => openEdit(f.id)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const cl = clienti?.find((c) => c.ragione_sociale === f.ragione_sociale)
                          if (cl) handleExport(f.id, cl.id)
                        }} className="cursor-pointer">
                          <FileDown className="mr-2 h-4 w-4" />Esporta DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(f)} className="cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fattura Form Sheet */}
      <Sheet open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm() } else setFormOpen(true) }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-card border-border p-6">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingId ? "Modifica Fattura" : "Nuova Fattura"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Header info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dati fattura</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">N. Fattura *</label>
                  <Input value={numeroFattura} onChange={(e) => setNumeroFattura(e.target.value)} placeholder="2024/001" className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Documento *</label>
                  <Input type="date" value={dataDocumento} onChange={(e) => setDataDocumento(e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Cliente *</label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                      <SelectValue placeholder="Seleziona cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {(clienti || []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.ragione_sociale}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Stato</label>
                  <Select value={stato} onValueChange={setStato}>
                    <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="bozza">Bozza</SelectItem>
                      <SelectItem value="emessa">Emessa</SelectItem>
                      <SelectItem value="pagata">Pagata</SelectItem>
                      <SelectItem value="annullata">Annullata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Modalita Pagamento</label>
                  <Select value={modalitaPagamentoId} onValueChange={setModalitaPagamentoId}>
                    <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {(modalitaPag || []).filter((m) => m.is_attiva).map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.descrizione}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Rif. Bolla N.</label>
                  <Input value={rifBollaNumero} onChange={(e) => setRifBollaNumero(e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium">Rif. Bolla Data</label>
                  <Input type="date" value={rifBollaData} onChange={(e) => setRifBollaData(e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium">IBAN</label>
                  <Input value={iban} onChange={(e) => setIban(e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium">Descr. Pagamento</label>
                  <Input value={descrizionePagamento} onChange={(e) => setDescrizionePagamento(e.target.value)} className="mt-1 bg-secondary/50 border-border" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Note</label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 bg-secondary/50 border-border resize-none" />
                </div>
              </div>
            </div>

            {/* Righe fattura */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Righe fattura</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setRighe((prev) => [...prev, newRiga()])} className="border-border">
                  <Plus className="mr-1 h-3 w-3" />Aggiungi riga
                </Button>
              </div>

              <div className="space-y-2">
                {righe.map((riga, i) => (
                  <div key={riga.key} className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Riga {i + 1}</span>
                      {righe.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRiga(riga.key)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Descrizione"
                      value={riga.descrizione}
                      onChange={(e) => updateRiga(riga.key, "descrizione", e.target.value)}
                      className="bg-background border-border text-sm"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Qta</label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={riga.quantita || ""}
                          onChange={(e) => updateRiga(riga.key, "quantita", Number(e.target.value))}
                          className="bg-background border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prezzo unit.</label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={riga.prezzo_unitario || ""}
                          onChange={(e) => updateRiga(riga.key, "prezzo_unitario", Number(e.target.value))}
                          className="bg-background border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Aliquota IVA</label>
                        <Select value={riga.aliquota_iva_id ? String(riga.aliquota_iva_id) : ""} onValueChange={(v) => updateRiga(riga.key, "aliquota_iva_id", Number(v))}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="IVA" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {(aliquote || []).filter((a) => a.is_attiva).map((a) => (
                              <SelectItem key={a.id} value={String(a.id)}>{a.percentuale}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Totale riga</label>
                        <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/50 text-sm font-mono">
                          {formatCurrency(riga.importo_totale)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totali */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Riepilogo</h3>
              <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Sconto %</label>
                    <Input type="number" step="0.01" min="0" max="100" value={scontoPercentuale || ""} onChange={(e) => setScontoPercentuale(Number(e.target.value))} className="bg-background border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Spese incasso</label>
                    <Input type="number" step="0.01" min="0" value={speseIncasso || ""} onChange={(e) => setSpeseIncasso(Number(e.target.value))} className="bg-background border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Acconto</label>
                    <Input type="number" step="0.01" min="0" value={acconto || ""} onChange={(e) => setAcconto(Number(e.target.value))} className="bg-background border-border text-sm" />
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Totale merce</span>
                    <span className="font-mono">{formatCurrency(totaleMerce)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Totale imponibile</span>
                    <span className="font-mono">{formatCurrency(totaleImponibile)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Totale imposta</span>
                    <span className="font-mono">{formatCurrency(totaleImposta)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                    <span>Totale fattura</span>
                    <span className="font-mono">{formatCurrency(totaleFattura)}</span>
                  </div>
                  {acconto > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Da pagare</span>
                      <span className="font-mono">{formatCurrency(daPagare)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scadenza preview */}
            {selectedModalita && dataScadenza && daPagare > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Scadenziario (auto)</h3>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Rata 1</Badge>
                      <span className="text-muted-foreground">{dataScadenza}</span>
                    </div>
                    <span className="font-mono font-medium">{formatCurrency(daPagare)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedModalita.descrizione} - {selectedModalita.giorni_scadenza} giorni
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1 border-border" onClick={() => { setFormOpen(false); resetForm() }}>
                Annulla
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Salva Modifiche" : "Crea Fattura"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la fattura {deleteTarget?.numero_fattura}? Verranno eliminate anche le righe e le scadenze associate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
