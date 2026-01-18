interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: string
}

export function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <section className="bg-muted/50 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {breadcrumb && (
          <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
            {breadcrumb}
          </span>
        )}
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
