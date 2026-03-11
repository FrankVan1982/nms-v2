"use client"

import { useMemo } from "react"
import type { ScadenzaPendente } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"

interface ScadenzeTableProps {
  scadenze: ScadenzaPendente[]
}

export function ScadenzeTable({ scadenze }: ScadenzeTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT")
  }

  const getUrgencyBadge = (urgenza: string) => {
    switch (urgenza) {
      case "scaduta":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Scaduta
          </Badge>
        )
      case "urgente":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Urgente
          </Badge>
        )
      case "prossima":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Prossima
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            In scadenza
          </Badge>
        )
    }
  }

  // Group by urgency
  const groupedScadenze = useMemo(() => {
    const groups = {
      scaduta: [] as ScadenzaPendente[],
      urgente: [] as ScadenzaPendente[],
      prossima: [] as ScadenzaPendente[],
      normale: [] as ScadenzaPendente[],
    }
    scadenze.forEach((s) => {
      if (s.urgenza === "scaduta") groups.scaduta.push(s)
      else if (s.urgenza === "urgente") groups.urgente.push(s)
      else if (s.urgenza === "prossima") groups.prossima.push(s)
      else groups.normale.push(s)
    })
    return groups
  }, [scadenze])

  const totaleScadenze = scadenze.reduce((sum, s) => sum + s.importo, 0)

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scadenze Pendenti ({scadenze.length})
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            {groupedScadenze.scaduta.length > 0 && (
              <span className="text-destructive font-medium">
                {groupedScadenze.scaduta.length} scadute
              </span>
            )}
            {groupedScadenze.urgente.length > 0 && (
              <span className="text-amber-600 font-medium">
                {groupedScadenze.urgente.length} urgenti
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Fattura</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Data Scadenza</TableHead>
                <TableHead className="font-semibold text-right">Importo</TableHead>
                <TableHead className="font-semibold">Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scadenze.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nessuna scadenza pendente
                  </TableCell>
                </TableRow>
              ) : (
                scadenze.map((scadenza) => (
                  <TableRow
                    key={scadenza.id}
                    className={
                      scadenza.urgenza === "scaduta"
                        ? "bg-destructive/5 hover:bg-destructive/10"
                        : scadenza.urgenza === "urgente"
                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                        : "hover:bg-muted/30"
                    }
                  >
                    <TableCell>
                      <div className="font-medium">{scadenza.numero_fattura}</div>
                      {scadenza.numero_rata > 1 && (
                        <div className="text-xs text-muted-foreground">
                          Rata {scadenza.numero_rata}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{scadenza.ragione_sociale}</TableCell>
                    <TableCell>{formatDate(scadenza.data_scadenza)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(scadenza.importo)}
                    </TableCell>
                    <TableCell>{getUrgencyBadge(scadenza.urgenza)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {scadenze.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="text-sm">
              <span className="text-muted-foreground">Totale da incassare: </span>
              <span className="font-semibold text-lg">{formatCurrency(totaleScadenze)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
