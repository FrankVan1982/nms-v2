"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, AlertTriangle, TrendingUp, CreditCard, Clock } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totaleClienti: number
    totalefatture: number
    fattureNonPagate: number
    scadenzeUrgenti: number
    totaleIncassi: number
    totaleCrediti: number
  } | null
  isLoading?: boolean
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: "Clienti",
      value: stats.totaleClienti.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Fatture Totali",
      value: stats.totalefatture.toString(),
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Da Incassare",
      value: stats.fattureNonPagate.toString(),
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Scadenze Urgenti",
      value: stats.scadenzeUrgenti.toString(),
      icon: AlertTriangle,
      color: stats.scadenzeUrgenti > 0 ? "text-red-600" : "text-muted-foreground",
      bgColor: stats.scadenzeUrgenti > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-muted",
    },
    {
      title: "Totale Incassi",
      value: formatCurrency(stats.totaleIncassi),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Crediti Aperti",
      value: formatCurrency(stats.totaleCrediti),
      icon: CreditCard,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
