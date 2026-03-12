"use client"

import { useState } from "react"
import type { Client } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileDown,
  Search,
  Building2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type ExportType = "scheda" | "ddt" | "fattura"

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
  onExport: (id: number, type: ExportType) => void
}

export function ClientsTable({
  clients,
  onEdit,
  onDelete,
  onExport,
}: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  const filteredClients = clients.filter(
    (client) =>
      client.ragione_sociale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.partita_iva?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.codice_fiscale?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (clientToDelete) {
      onDelete(clientToDelete.id)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca clienti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">Ragione Sociale</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">P.IVA / C.F.</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Email</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Telefono</TableHead>
              <TableHead className="text-muted-foreground hidden xl:table-cell">Citta</TableHead>
              <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8" />
                    <p>Nessun cliente trovato</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-border hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-medium">{client.ragione_sociale}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.partita_iva || client.codice_fiscale || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {client.email || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {client.telefono || "-"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground">
                    {client.citta ? `${client.citta}${client.provincia ? ` (${client.provincia})` : ""}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Apri menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => onEdit(client)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
                          <FileDown className="h-3 w-3" />
                          Esporta .docx
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onExport(client.id, "scheda")}
                          className="cursor-pointer pl-7"
                        >
                          Scheda Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onExport(client.id, "ddt")}
                          className="cursor-pointer pl-7"
                        >
                          DDT
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onExport(client.id, "fattura")}
                          className="cursor-pointer pl-7"
                        >
                          Fattura
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(client)}
                          className="cursor-pointer text-destructive focus:text-destructive"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare {clientToDelete?.ragione_sociale}? Questa azione non puo essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
