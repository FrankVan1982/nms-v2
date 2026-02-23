"use client"

import { useState } from "react"
import useSWR from "swr"
import type { ModalitaPagamento } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ModalitaPagamentoSection() {
  const { data: modalita, mutate } = useSWR<ModalitaPagamento[]>("/admin/api/modalita-pagamento", fetcher)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ModalitaPagamento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ModalitaPagamento | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [codice, setCodice] = useState("")
  const [descrizione, setDescrizione] = useState("")
  const [giorniScadenza, setGiorniScadenza] = useState("")
  const [isAttiva, setIsAttiva] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setCodice("")
    setDescrizione("")
    setGiorniScadenza("")
    setIsAttiva(true)
    setFormOpen(true)
  }

  const openEdit = (m: ModalitaPagamento) => {
    setEditing(m)
    setCodice(m.codice)
    setDescrizione(m.descrizione)
    setGiorniScadenza(String(m.giorni_scadenza))
    setIsAttiva(m.is_attiva)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!codice || !descrizione) return
    setIsSubmitting(true)
    try {
      const url = editing ? `/admin/api/modalita-pagamento/${editing.id}` : "/admin/api/modalita-pagamento"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codice, descrizione, giorni_scadenza: Number(giorniScadenza) || 0, is_attiva: isAttiva }),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? "Modalita aggiornata" : "Modalita creata")
      setFormOpen(false)
      mutate()
    } catch {
      toast.error("Errore nel salvataggio")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/admin/api/modalita-pagamento/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Modalita eliminata")
      setDeleteTarget(null)
      mutate()
    } catch {
      toast.error("Errore nell'eliminazione")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Modalita di Pagamento</h2>
          <p className="text-sm text-muted-foreground">Configura le modalita di pagamento e i giorni di scadenza</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Modalita
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">Codice</TableHead>
              <TableHead className="text-muted-foreground">Descrizione</TableHead>
              <TableHead className="text-muted-foreground">Giorni Scadenza</TableHead>
              <TableHead className="text-muted-foreground">Stato</TableHead>
              <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!modalita || modalita.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-8 w-8" />
                    <p>Nessuna modalita configurata</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              modalita.map((m) => (
                <TableRow key={m.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm">{m.codice}</TableCell>
                  <TableCell className="font-medium">{m.descrizione}</TableCell>
                  <TableCell>{m.giorni_scadenza} gg</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${m.is_attiva ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {m.is_attiva ? "Attiva" : "Disattiva"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(m)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica Modalita" : "Nuova Modalita"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Codice *</label>
              <Input value={codice} onChange={(e) => setCodice(e.target.value)} placeholder="es. MP05" className="mt-1 bg-secondary/50 border-border" />
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione *</label>
              <Input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="es. Bonifico bancario 30gg" className="mt-1 bg-secondary/50 border-border" />
            </div>
            <div>
              <label className="text-sm font-medium">Giorni Scadenza</label>
              <Input type="number" value={giorniScadenza} onChange={(e) => setGiorniScadenza(e.target.value)} placeholder="30" className="mt-1 bg-secondary/50 border-border" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isAttiva} onCheckedChange={setIsAttiva} />
              <label className="text-sm font-medium">Attiva</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} className="border-border">Annulla</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salva" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la modalita &quot;{deleteTarget?.descrizione}&quot;?
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
