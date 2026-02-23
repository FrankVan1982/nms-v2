"use client"

import { useState } from "react"
import useSWR from "swr"
import type { AliquotaIva } from "@/lib/db"
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
import { Plus, Pencil, Trash2, Percent, Loader2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AliquoteIvaSection() {
  const { data: aliquote, mutate } = useSWR<AliquotaIva[]>("/admin/api/aliquote-iva", fetcher)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AliquotaIva | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AliquotaIva | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [descrizione, setDescrizione] = useState("")
  const [percentuale, setPercentuale] = useState("")
  const [isAttiva, setIsAttiva] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setDescrizione("")
    setPercentuale("")
    setIsAttiva(true)
    setFormOpen(true)
  }

  const openEdit = (a: AliquotaIva) => {
    setEditing(a)
    setDescrizione(a.descrizione)
    setPercentuale(String(a.percentuale))
    setIsAttiva(a.is_attiva)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!descrizione || !percentuale) return
    setIsSubmitting(true)
    try {
      const url = editing ? `/admin/api/aliquote-iva/${editing.id}` : "/admin/api/aliquote-iva"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descrizione, percentuale: Number(percentuale), is_attiva: isAttiva }),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? "Aliquota aggiornata" : "Aliquota creata")
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
      const res = await fetch(`/admin/api/aliquote-iva/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Aliquota eliminata")
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
          <h2 className="text-lg font-semibold">Aliquote IVA</h2>
          <p className="text-sm text-muted-foreground">Gestisci le aliquote IVA utilizzabili nelle fatture</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Aliquota
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">Descrizione</TableHead>
              <TableHead className="text-muted-foreground">Percentuale</TableHead>
              <TableHead className="text-muted-foreground">Stato</TableHead>
              <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!aliquote || aliquote.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Percent className="h-8 w-8" />
                    <p>Nessuna aliquota configurata</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              aliquote.map((a) => (
                <TableRow key={a.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-medium">{a.descrizione}</TableCell>
                  <TableCell>{a.percentuale}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${a.is_attiva ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {a.is_attiva ? "Attiva" : "Disattiva"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(a)}>
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
            <DialogTitle>{editing ? "Modifica Aliquota" : "Nuova Aliquota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Descrizione *</label>
              <Input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="es. IVA 22%" className="mt-1 bg-secondary/50 border-border" />
            </div>
            <div>
              <label className="text-sm font-medium">Percentuale *</label>
              <Input type="number" step="0.01" value={percentuale} onChange={(e) => setPercentuale(e.target.value)} placeholder="22" className="mt-1 bg-secondary/50 border-border" />
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
              Sei sicuro di voler eliminare l&apos;aliquota &quot;{deleteTarget?.descrizione}&quot;?
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
