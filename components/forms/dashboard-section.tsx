"use client"

import useSWR from "swr"
import type { DashboardData } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { FileText, Euro, AlertTriangle, Users } from "lucide-react"

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

function statoBadge(stato: string) {
  const map: Record<string, { className: string; label: string }> = {
    bozza: { className: "bg-muted text-muted-foreground", label: "Bozza" },
    emessa: { className: "bg-blue-500/10 text-blue-600", label: "Emessa" },
    pagata: { className: "bg-emerald-500/10 text-emerald-600", label: "Pagata" },
    annullata: { className: "bg-destructive/10 text-destructive", label: "Annullata" },
  }
  const badge = map[stato] || map.bozza
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
}

export function DashboardSection() {
  const { data, isLoading } = useSWR<DashboardData>("/admin/api/dashboard", fetcher)

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-card border border-border animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-card border border-border animate-pulse" />
      </div>
    )
  }

  const stats = [
    { title: "Fatture Totali", value: data.totale_fatture, icon: FileText, description: "Fatture emesse" },
    { title: "Da Incassare", value: formatCurrency(data.totale_da_incassare), icon: Euro, description: "Importi in sospeso" },
    { title: "Scadenze Urgenti", value: data.scadenze_urgenti, icon: AlertTriangle, description: "Scadute o in scadenza" },
    { title: "Clienti Attivi", value: data.clienti_attivi, icon: Users, description: "Nel database" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Scadenze Prossime</CardTitle>
          </CardHeader>
          <CardContent>
            {data.scadenze_prossime.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nessuna scadenza pendente</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground text-xs">Cliente</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Scadenza</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Importo</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.scadenze_prossime.map((s) => (
                    <TableRow key={s.id} className="border-border">
                      <TableCell className="text-sm font-medium">{s.ragione_sociale}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(s.data_scadenza)}</TableCell>
                      <TableCell className="text-sm text-right font-mono">{formatCurrency(s.importo)}</TableCell>
                      <TableCell>{urgencyBadge(s.urgenza)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Fatture Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            {data.fatture_recenti.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nessuna fattura presente</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground text-xs">N. Fattura</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Cliente</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Totale</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.fatture_recenti.map((f) => (
                    <TableRow key={f.id} className="border-border">
                      <TableCell className="text-sm font-mono">{f.numero_fattura}</TableCell>
                      <TableCell className="text-sm font-medium">{f.ragione_sociale}</TableCell>
                      <TableCell className="text-sm text-right font-mono">{formatCurrency(f.totale_fattura)}</TableCell>
                      <TableCell>{statoBadge(f.stato)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
