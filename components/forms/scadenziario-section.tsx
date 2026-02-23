"use client"

import { useState } from "react"
import useSWR from "swr"
import type { ScadenzaPendente } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCurrency(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT")
}

function urgencyBadge(urgenza: string) {
  const map: Record<string, { className: string; label: string }> = {
    scaduta: { className: "bg-destructive/10 text-destructive border-destructive/20", label: "Scaduta" },
    urgente: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Urgente" },
    in_scadenza: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "In scadenza" },
    regolare: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Regolare" },
  }
  const badge = map[urgenza] || map.regolare
  return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
}

export function ScadenziarioSection() {
  const { data: scadenze, mutate } = useSWR<ScadenzaPendente[]>("/admin/api/scadenziario", fetcher)
  const [filterUrgenza, setFilterUrgenza] = useState<string>("tutte")
  const [payTarget, setPayTarget] = useState<ScadenzaPendente | null>(null)

  const filteredScadenze = (scadenze || []).filter((s) => {
    if (filterUrgenza === "tutte") return true
    return s.urgenza === filterUrgenza
  })

  const handleMarkPaid = async () => {
    if (!payTarget) return
    try {
      const res = await fetch(`/admin/api/scadenziario/${payTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stato: "pagata",
          data_pagamento: new Date().toISOString().split("T")[0],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Scadenza segnata come pagata")
      setPayTarget(null)
      mutate()
    } catch {
      toast.error("Errore nell'aggiornamento")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Scadenziario</h2>
          <p className="text-sm text-muted-foreground">Monitora le scadenze dei pagamenti</p>
        </div>
        <Select value={filterUrgenza} onValueChange={setFilterUrgenza}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
            <SelectValue placeholder="Filtra urgenza" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="tutte">Tutte</SelectItem>
            <SelectItem value="scaduta">Scadute</SelectItem>
            <SelectItem value="urgente">Urgenti</SelectItem>
            <SelectItem value="in_scadenza">In scadenza</SelectItem>
            <SelectItem value="regolare">Regolari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">N. Fattura</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Rata</TableHead>
              <TableHead className="text-muted-foreground">Scadenza</TableHead>
              <TableHead className="text-muted-foreground text-right">Importo</TableHead>
              <TableHead className="text-muted-foreground">Urgenza</TableHead>
              <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScadenze.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Calendar className="h-8 w-8" />
                    <p>Nessuna scadenza pendente</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredScadenze.map((s) => (
                <TableRow key={s.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm">{s.numero_fattura}</TableCell>
                  <TableCell className="font-medium">{s.ragione_sociale}</TableCell>
                  <TableCell className="text-muted-foreground">Rata {s.numero_rata}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.data_scadenza)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(s.importo)}</TableCell>
                  <TableCell>{urgencyBadge(s.urgenza)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700" onClick={() => setPayTarget(s)}>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Pagata
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!payTarget} onOpenChange={() => setPayTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi segnare come pagata la rata di {payTarget ? formatCurrency(payTarget.importo) : ""} per la fattura {payTarget?.numero_fattura} ({payTarget?.ragione_sociale})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid} className="bg-emerald-600 text-white hover:bg-emerald-700">
              Conferma Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
