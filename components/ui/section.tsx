import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  variant?: "default" | "muted" | "primary"
}

export function Section({ children, className, id, variant = "default" }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-20 lg:py-24",
        variant === "muted" && "bg-muted/50",
        variant === "primary" && "bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  label?: string
  labelColor?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeader({ title, subtitle, label, align = "center", className, labelColor }: SectionHeaderProps) {
  return (
    <div className={cn(
      "max-w-3xl mb-12 md:mb-16",
      align === "center" && "mx-auto text-center",
      className
    )}>
      {label && labelColor && (
        <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
          {label}
        </span>
      )}
      <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}
