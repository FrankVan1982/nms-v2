import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeader } from "@/components/sections/page-header"
import { CTA } from "@/components/sections/cta"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Galleria lavorazioni | Nuova Misura Scale",
  description: "Scopri le nostre lavorazioni artigianali: scale a chiocciola, scale a giorno, ringhiere, balaustre e rivestimenti in legno e metallo.",
}

const services = [
  {
    id: "scale-chiocciola",
    title: "Scale a Chiocciola",
    subtitle: "Eleganza e risparmio di spazio",
    description: "Le scale a chiocciola rappresentano la soluzione ideale per chi desidera unire funzionalità ed estetica in spazi ridotti. Realizziamo scale elicoidali in legno massello, metallo o combinazioni di entrambi i materiali, con gradini a pianta trapezoidale che si sviluppano intorno ad un palo centrale.",
    features: [
      "Design compatto e salvaspazio",
      "Struttura autoportante",
      "Personalizzazione totale",
      "Legno massello o metallo",
      "Ringhiera integrata",
    ],
    image: "/images/scale-chiocciola.jpg",
  },
  {
    id: "scale-giorno",
    title: "Scale a Giorno",
    subtitle: "Modernità e luminosità",
    description: "Le scale a giorno, dette anche scale aperte o scale a sbalzo, sono caratterizzate dall'assenza di alzate, permettendo alla luce di passare attraverso i gradini. Ideali per ambienti moderni e contemporanei, conferiscono leggerezza e ampiezza agli spazi.",
    features: [
      "Gradini a sbalzo",
      "Massima luminosità",
      "Design contemporaneo",
      "Vetro, legno o acciaio",
      "Effetto scenografico",
    ],
    image: "/images/scale-giorno.jpg",
  },
  {
    id: "ringhiere",
    title: "Ringhiere e Balaustre",
    subtitle: "Sicurezza e design",
    description: "Le nostre ringhiere e balaustre sono realizzate con maestria artigianale, combinando funzionalità e bellezza. Dal ferro battuto tradizionale alle soluzioni moderne in acciaio inox e vetro, ogni elemento è progettato per garantire sicurezza e valorizzare l'estetica della scala.",
    features: [
      "Ferro battuto artistico",
      "Acciaio inox",
      "Combinazioni legno-metallo",
      "Vetro temperato",
      "Corrimano curvi su misura",
    ],
    image: "/images/ringhiere.jpg",
  },
  {
    id: "rivestimenti",
    title: "Rivestimenti",
    subtitle: "Rinnova le tue scale",
    description: "Il rivestimento in legno delle scale esistenti è la soluzione perfetta per rinnovare e valorizzare scale in cemento, marmo o altri materiali. Utilizziamo legni pregiati per creare rivestimenti che trasformano completamente l'aspetto delle tue scale.",
    features: [
      "Rivestimento gradini",
      "Copertura alzate",
      "Zoccolini laterali",
      "Legni pregiati",
      "Restauro scale antiche",
    ],
    image: "/images/rivestimenti.jpg",
  },
]

const materials = [
  { name: "Rovere", description: "Resistente e versatile" },
  { name: "Noce", description: "Elegante e pregiato" },
  { name: "Frassino", description: "Chiaro e moderno" },
  { name: "Faggio", description: "Compatto e durevole" },
  { name: "Ferro Battuto", description: "Artistico e tradizionale" },
  { name: "Acciaio Inox", description: "Moderno e resistente" },
]

export default function LavorazioniPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader
          breadcrumb="Galleria lavorazioni"
          title="Le nostre specializzazioni"
          subtitle="Scale a chiocciola, scale a giorno, ringhiere, balaustre e rivestimenti. Ogni lavorazione è un pezzo unico, realizzato su misura per te."
        />

        {/* Services */}
        {services.map((service, index) => (
          <Section key={service.id} id={service.id} variant={index % 2 === 1 ? "muted" : "default"}>
            <div className={`grid items-center gap-12 lg:grid-cols-2 ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
              <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                <Badge variant="secondary" className="mb-4">
                  {String(index + 1).padStart(2, "0")}
                </Badge>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                  {service.title}
                </h2>
                <p className="mt-2 text-lg text-primary font-medium">
                  {service.subtitle}
                </p>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="/contatti">Richiedi Preventivo</Link>
                  </Button>
                </div>
              </div>
              <div className={`relative aspect-[4/3] overflow-hidden rounded-lg ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Section>
        ))}

        {/* Materials Section */}
        <Section variant="muted">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
              Materiali
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Solo i migliori materiali
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Selezioniamo con cura legni pregiati e metalli di qualità per garantire durabilità e bellezza nel tempo.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {materials.map((material) => (
              <div key={material.name} className="rounded-lg border border-border bg-card p-4 text-center">
                <h3 className="font-semibold text-foreground">{material.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{material.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Process Section */}
        <Section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider mb-3 block">
              Il Nostro Processo
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Come lavoriamo
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Consulenza", desc: "Ascoltiamo le tue esigenze e valutiamo gli spazi" },
              { step: "02", title: "Progettazione", desc: "Creiamo il progetto su misura per te" },
              { step: "03", title: "Realizzazione", desc: "Produciamo nel nostro laboratorio artigianale" },
              { step: "04", title: "Installazione", desc: "Montiamo con cura e precisione" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <CTA
          title="Hai un progetto in mente?"
          subtitle="Contattaci per una consulenza gratuita. Ti aiuteremo a realizzare la scala perfetta per i tuoi spazi."
          action={{ label: "Richiedi Preventivo", href: "/contatti" }}
        />
      </main>
      <Footer />
    </>
  )
}
