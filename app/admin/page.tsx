"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { Client, ClientInput, FatturaCompleta, ScadenzaPendente, Fattura, RigaFattura } from "@/lib/db"
import { ClientsTable, type ExportType } from "@/components/forms/clients-table"
import { ClientForm } from "@/components/forms/client-form"
import { FattureTable } from "@/components/forms/fatture-table"
import { FatturaForm } from "@/components/forms/fattura-form"
import { ScadenzeTable } from "@/components/forms/scadenze-table"
import { DashboardStats } from "@/components/forms/dashboard-stats"
import { StatsCards } from "@/components/forms/stats-cards"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster, toast } from "sonner"
import { Plus, Database, RefreshCw, Users, FileText, Clock, LayoutDashboard } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }
  const data = await res.json()
  return Array.isArray(data) ? data : data
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Data fetching
  const { data: clients, error: clientsError, isLoading: clientsLoading, mutate: mutateClients } = useSWR<Client[]>(
    "/admin/api/clients",
    fetcher
  )

  const { data: fatture, error: fattureError, isLoading: fattureLoading, mutate: mutateFatture } = useSWR<FatturaCompleta[]>(
    "/admin/api/fatture",
    fetcher
  )

  const { data: scadenze, error: scadenzeError, isLoading: scadenzeLoading, mutate: mutateScadenze } = useSWR<ScadenzaPendente[]>(
    "/admin/api/scadenze",
    fetcher
  )

  const { data: dashboardStats, isLoading: statsLoading, mutate: mutateStats } = useSWR<{
    totaleClienti: number
    totalefatture: number
    fattureNonPagate: number
    scadenzeUrgenti: number
    totaleIncassi: number
    totaleCrediti: number
  }>("/admin/api/dashboard", fetcher)

  // Client form state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fattura form state
  const [fatturaFormOpen, setFatturaFormOpen] = useState(false)
  const [selectedFattura, setSelectedFattura] = useState<Fattura | null>(null)
  const [selectedFatturaRighe, setSelectedFatturaRighe] = useState<RigaFattura[]>([])
  const [isFatturaSubmitting, setIsFatturaSubmitting] = useState(false)

  const handleRefreshAll = () => {
    mutateClients()
    mutateFatture()
    mutateScadenze()
    mutateStats()
    toast.success("Dati aggiornati")
  }

  // Client handlers
  const handleCreateClient = () => {
    setSelectedClient(null)
    setFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setFormOpen(true)
  }

  const handleDeleteClient = async (id: number) => {
    try {
      const response = await fetch(`/admin/api/clients/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete client")
      }

      toast.success("Cliente eliminato con successo")
      mutateClients()
      mutateStats()
    } catch {
      toast.error("Errore durante l'eliminazione del cliente")
    }
  }

  const handleExportClient = useCallback(async (id: number, type: ExportType) => {
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

  const handleSubmitClient = async (data: ClientInput) => {
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
      mutateClients()
      mutateStats()
    } catch {
      toast.error("Errore durante il salvataggio del cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fattura handlers
  const handleCreateFattura = () => {
    setSelectedFattura(null)
    setSelectedFatturaRighe([])
    setFatturaFormOpen(true)
  }

  const handleViewFattura = async (fattura: FatturaCompleta) => {
    // Load full fattura data for viewing/editing
    try {
      const response = await fetch(`/admin/api/fatture/${fattura.id}`)
      if (!response.ok) throw new Error("Failed to fetch fattura")
      const data = await response.json()
      setSelectedFattura(data.fattura)
      setSelectedFatturaRighe(data.righe || [])
      setFatturaFormOpen(true)
    } catch {
      toast.error("Errore nel caricamento della fattura")
    }
  }

  const handleEditFattura = async (fattura: FatturaCompleta) => {
    // Same as view - opens the form for editing
    await handleViewFattura(fattura)
  }

  const handleDeleteFattura = async (id: number) => {
    try {
      const response = await fetch(`/admin/api/fatture/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete fattura")
      }

      toast.success("Fattura eliminata con successo")
      mutateFatture()
      mutateScadenze()
      mutateStats()
    } catch {
      toast.error("Errore durante l'eliminazione della fattura")
    }
  }

  const handleSubmitFattura = async (
    data: {
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
    },
    righe: {
      id?: number
      posizione: number
      descrizione: string
      quantita: number
      prezzo_unitario: number
      aliquota_iva_id: number | null
      percentuale_iva: number
    }[]
  ) => {
    setIsFatturaSubmitting(true)
    try {
      const url = selectedFattura
        ? `/admin/api/fatture/${selectedFattura.id}`
        : "/admin/api/fatture"
      const method = selectedFattura ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, righe }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || "Errore durante il salvataggio"
        throw new Error(errorMessage)
      }

      toast.success(
        selectedFattura
          ? "Fattura aggiornata con successo"
          : "Fattura creata con successo"
      )
      setFatturaFormOpen(false)
      setSelectedFattura(null)
      setSelectedFatturaRighe([])
      mutateFatture()
      mutateScadenze()
      mutateStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante il salvataggio della fattura"
      toast.error(message)
    } finally {
      setIsFatturaSubmitting(false)
    }
  }

  const isLoading = clientsLoading || fattureLoading || scadenzeLoading
  const hasError = clientsError || fattureError || scadenzeError

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
                <h1 className="text-xl font-semibold">Pannello Amministrazione</h1>
                <p className="text-sm text-muted-foreground">
                  Gestione clienti, fatture e scadenze
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshAll}
                className="border-border"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Aggiorna</span>
              </Button>
              {activeTab === "clienti" && (
                <Button onClick={handleCreateClient}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo Cliente
                </Button>
              )}
              {activeTab === "fatture" && (
                <Button onClick={handleCreateFattura}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Fattura
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="clienti" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clienti</span>
            </TabsTrigger>
            <TabsTrigger value="fatture" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Fatture</span>
            </TabsTrigger>
            <TabsTrigger value="scadenze" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Scadenze</span>
            </TabsTrigger>
          </TabsList>

          {hasError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Errore nel caricamento dei dati</p>
              <Button variant="outline" onClick={handleRefreshAll} className="mt-4">
                Riprova
              </Button>
            </div>
          ) : (
            <>
              <TabsContent value="dashboard" className="space-y-6">
                <DashboardStats stats={dashboardStats || null} isLoading={statsLoading} />
                
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent unpaid invoices */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Ultime Fatture Non Pagate</h3>
                    {fattureLoading ? (
                      <div className="h-48 bg-card border border-border rounded-lg animate-pulse" />
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium">Fattura</th>
                              <th className="px-4 py-2 text-left font-medium">Cliente</th>
                              <th className="px-4 py-2 text-right font-medium">Importo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(fatture || [])
                              .filter((f) => f.stato !== "pagata")
                              .slice(0, 5)
                              .map((f) => (
                                <tr key={f.id} className="border-t border-border">
                                  <td className="px-4 py-2 font-medium">{f.numero_fattura}</td>
                                  <td className="px-4 py-2 text-muted-foreground">{f.ragione_sociale}</td>
                                  <td className="px-4 py-2 text-right">
                                    {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(f.da_pagare)}
                                  </td>
                                </tr>
                              ))}
                            {(fatture || []).filter((f) => f.stato !== "pagata").length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                  Nessuna fattura da incassare
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Urgent deadlines */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Scadenze Urgenti</h3>
                    {scadenzeLoading ? (
                      <div className="h-48 bg-card border border-border rounded-lg animate-pulse" />
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium">Scadenza</th>
                              <th className="px-4 py-2 text-left font-medium">Cliente</th>
                              <th className="px-4 py-2 text-right font-medium">Importo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(scadenze || [])
                              .filter((s) => s.urgenza === "scaduta" || s.urgenza === "urgente")
                              .slice(0, 5)
                              .map((s) => (
                                <tr key={s.id} className={`border-t border-border ${s.urgenza === "scaduta" ? "bg-destructive/5" : "bg-amber-500/5"}`}>
                                  <td className="px-4 py-2 font-medium">
                                    {new Date(s.data_scadenza).toLocaleDateString("it-IT")}
                                  </td>
                                  <td className="px-4 py-2 text-muted-foreground">{s.ragione_sociale}</td>
                                  <td className="px-4 py-2 text-right">
                                    {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(s.importo)}
                                  </td>
                                </tr>
                              ))}
                            {(scadenze || []).filter((s) => s.urgenza === "scaduta" || s.urgenza === "urgente").length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                  Nessuna scadenza urgente
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clienti" className="space-y-6">
                {clientsLoading ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-lg bg-card border border-border animate-pulse" />
                      ))}
                    </div>
                    <div className="h-96 rounded-lg bg-card border border-border animate-pulse" />
                  </div>
                ) : (
                  <>
                    <StatsCards clients={clients || []} />
                    <ClientsTable
                      clients={clients || []}
                      onEdit={handleEditClient}
                      onDelete={handleDeleteClient}
                      onExport={handleExportClient}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="fatture" className="space-y-6">
                {fattureLoading ? (
                  <div className="h-96 rounded-lg bg-card border border-border animate-pulse" />
                ) : (
                  <FattureTable
                    fatture={fatture || []}
                    onEdit={handleEditFattura}
                    onDelete={handleDeleteFattura}
                    onView={handleViewFattura}
                  />
                )}
              </TabsContent>

              <TabsContent value="scadenze" className="space-y-6">
                {scadenzeLoading ? (
                  <div className="h-96 rounded-lg bg-card border border-border animate-pulse" />
                ) : (
                  <ScadenzeTable scadenze={scadenze || []} />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
        onSubmit={handleSubmitClient}
        isLoading={isSubmitting}
      />

      <FatturaForm
        open={fatturaFormOpen}
        onOpenChange={setFatturaFormOpen}
        fattura={selectedFattura}
        righe={selectedFatturaRighe}
        onSubmit={handleSubmitFattura}
        isLoading={isFatturaSubmitting}
      />
    </div>
  )
}
