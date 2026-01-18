import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroProps {
  title: string
  highlight?: string
  subtitle: string
  image: string
  primaryAction?: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
}

export function Hero({ title, highlight, subtitle, image, primaryAction, secondaryAction }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 blur-[2px]">
        <Image
          src={image || "/placeholder.svg"}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60 dark:bg-foreground/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white dark:text-black md:text-5xl lg:text-6xl xl:text-7xl text-balance">
            {title}
            {highlight && (
              <>
                <br />
                <span className="text-primary-foreground/90">{highlight}</span>
              </>
            )}
          </h1>
          <p className="mt-6 text-lg text-white/80 dark:text-black/80 md:text-xl leading-relaxed max-w-2xl text-pretty">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {primaryAction && (
              <Button size="lg" asChild className="text-base">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            )}
            {secondaryAction && (
              <Button size="lg" variant="outline" asChild className="text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6 text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
