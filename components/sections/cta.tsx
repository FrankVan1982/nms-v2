import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

interface CTAProps {
  title: string
  subtitle?: string
  action: {
    label: string
    href: string
  }
}

export function CTA({ title, subtitle, action }: CTAProps) {
  return (
    <Section variant="primary" className="py-16 md:py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed text-pretty">
            {subtitle}
          </p>
        )}
        <div className="mt-8">
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="text-base"
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}
