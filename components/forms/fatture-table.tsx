"use client"

import { useState, useMemo } from "react"
import type { FatturaCompleta } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface FattureTableProps {
  fatture: FatturaCompleta[]
  onEdit: (fattura: FatturaCompleta) => void
  onDelete: (id: number) => void
  onView: (fattura: FatturaCompleta) => void
}

const ITEMS_PER_PAGE = 10

export function FattureTable({ fatture, onEdit, onDelete, onView }: FattureTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredFatture = useMemo(() => {
    return fatture.filter((fattura) => {
      const matchesSearch =
        fattura.numero_fattura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fattura.ragione_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fattura.partita_iva?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesStatus = statusFilter === "all" || fattura.stato === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [fatture, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredFatture.length / ITEMS_PER_PAGE)
  const paginatedFatture = filteredFatture.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT")
  }

  const getStatusBadge = (stato: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      bozza: { variant: "outline", label: "Bozza" },
      emessa: { variant: "secondary", label: "Emessa" },
      inviata: { variant: "default", label: "Inviata" },
      pagata: { variant: "default", label: "Pagata" },
      parziale: { variant: "secondary", label: "Parziale" },
      scaduta: { variant: "destructive", label: "Scaduta" },
    }
    const { variant, label } = variants[stato] || { variant: "outline" as const, label: stato }
    return <Badge variant={variant}>{label}</Badge>
  }

  // Calculate totals
  const totals = useMemo(() => {
    return filteredFatture.reduce(
      (acc, f) => ({
        totale: acc.totale + (f.totale_fattura || 0),
        daPagare: acc.daPagare + (f.da_pagare || 0),
      }),
      { totale: 0, daPagare: 0 }
    )
  }, [filteredFatture])

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fatture ({filteredFatture.length})
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca fattura..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
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
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Numero</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold text-right">Totale</TableHead>
                <TableHead className="font-semibold text-right">Da Pagare</TableHead>
                <TableHead className="font-semibold">Stato</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFatture.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nessuna fattura trovata
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFatture.map((fattura) => (
                  <TableRow key={fattura.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{fattura.numero_fattura}</TableCell>
                    <TableCell>{formatDate(fattura.data_documento)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fattura.ragione_sociale}</div>
                        {fattura.partita_iva && (
                          <div className="text-xs text-muted-foreground">P.IVA: {fattura.partita_iva}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(fattura.totale_fattura)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(fattura.da_pagare)}
                    </TableCell>
                    <TableCell>{getStatusBadge(fattura.stato)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Azioni</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(fattura)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizza
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(fattura)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(fattura.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
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

        {/* Totals row */}
        <div className="mt-4 flex justify-end gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Totale fatturato: </span>
            <span className="font-semibold">{formatCurrency(totals.totale)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Da incassare: </span>
            <span className="font-semibold text-amber-600">{formatCurrency(totals.daPagare)}</span>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Pagina {currentPage} di {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
