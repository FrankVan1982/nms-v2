"use client"

import type { Client } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, MapPin, FileText } from "lucide-react"

interface StatsCardsProps {
  clients: Client[]
}

export function StatsCards({ clients }: StatsCardsProps) {
  const totalClients = clients.length
  const uniqueProvince = new Set(clients.map((c) => c.provincia).filter(Boolean)).size
  const clientsWithPIva = clients.filter((c) => c.partita_iva).length
  const recentClients = clients.filter((c) => {
    const createdAt = new Date(c.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdAt > thirtyDaysAgo
  }).length

  const stats = [
    {
      title: "Clienti Totali",
      value: totalClients,
      icon: Building2,
      description: "Aziende registrate",
    },
    {
      title: "Nuovi (30gg)",
      value: recentClients,
      icon: Users,
      description: "Aggiunti di recente",
    },
    {
      title: "Province",
      value: uniqueProvince,
      icon: MapPin,
      description: "Copertura geografica",
    },
    {
      title: "Con P.IVA",
      value: clientsWithPIva,
      icon: FileText,
      description: "Clienti con partita IVA",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
