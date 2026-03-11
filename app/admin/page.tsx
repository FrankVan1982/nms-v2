"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { Client, ClientInput } from "@/lib/db"
import { ClientsTable, type ExportType } from "@/components/forms/clients-table"
import { ClientForm } from "@/components/forms/client-form"
import { StatsCards } from "@/components/forms/stats-cards"
import { Button } from "@/components/ui/button"
import { Toaster, toast } from "sonner"
import { Plus, Database, RefreshCw } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch clients")
  }
  const data = await res.json()
  // Ensure we always return an array
  return Array.isArray(data) ? data : []
}

export default function ClientsPage() {
  const { data: clients, error, isLoading, mutate } = useSWR<Client[]>(
    "/admin/api/clients",
    fetcher
  )

  const [formOpen, setFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = () => {
    setSelectedClient(null)
    setFormOpen(true)
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/admin/api/clients/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete client")
      }

      toast.success("Cliente eliminato con successo")
      mutate()
    } catch {
      toast.error("Errore durante l'eliminazione del cliente")
    }
  }

  const handleExport = useCallback(async (id: number, type: ExportType) => {
    try {
      const response = await fetch(`/admin/api/clients/${id}/export?type=${type}`)

      if (!response.ok) {
        throw new Error("Failed to export client")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "document.docx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      const typeLabels: Record<ExportType, string> = {
        scheda: "Scheda cliente",
        ddt: "DDT",
        fattura: "Fattura"
      }
      toast.success(`${typeLabels[type]} esportata con successo`)
    } catch {
      toast.error("Errore durante l'esportazione del documento")
    }
  }, [])

  const handleSubmit = async (data: ClientInput) => {
    setIsSubmitting(true)
    try {
      const url = selectedClient
        ? `/admin/api/clients/${selectedClient.id}`
        : "/admin/api/clients"
      const method = selectedClient ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save client")
      }

      toast.success(
        selectedClient
          ? "Cliente aggiornato con successo"
          : "Cliente creato con successo"
      )
      setFormOpen(false)
      setSelectedClient(null)
      mutate()
    } catch {
      toast.error("Errore durante il salvataggio del cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Gestione Clienti</h1>
                <p className="text-sm text-muted-foreground">
                  Database aziendale clienti
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => mutate()}
                className="border-border"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Aggiorna</span>
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Cliente
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">
              Errore nel caricamento dei clienti
            </p>
            <Button variant="outline" onClick={() => mutate()} className="mt-4">
              Riprova
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-card border border-border animate-pulse"
                />
              ))}
            </div>
            <div className="h-96 rounded-lg bg-card border border-border animate-pulse" />
          </div>
        ) : (
          <>
            <StatsCards clients={clients || []} />
            <ClientsTable
              clients={clients || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          </>
        )}
      </main>

      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
