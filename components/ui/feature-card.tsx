import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  number?: string
  className?: string
}

export function FeatureCard({ title, description, icon, number, className }: FeatureCardProps) {
  return (
    <Card className={cn("border border-border bg-card transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          {number && (
            <span className="font-serif text-4xl font-bold text-primary/20 md:text-5xl">
              {number}
            </span>
          )}
          <div className="flex-1">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
