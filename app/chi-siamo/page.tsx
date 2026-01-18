import type { Metadata } from "next"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeader } from "@/components/sections/page-header"
import { CTA } from "@/components/sections/cta"
import { Section, SectionHeader } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Chi Siamo | Nuova Misura Scale",
  description: "Scopri la storia di Nuova Misura Scale, cooperativa artigianale specializzata nella fabbricazione di scale su misura dal 1984 a Corato, Puglia.",
}

const timeline = [
  {
    year: "1984",
    title: "La Fondazione",
    description: "Nasce la cooperativa Nuova Misura Scale, unendo l'esperienza di artigiani esperti nella lavorazione del legno.",
  },
  {
    year: "1990",
    title: "Espansione",
    description: "Ampliamento del laboratorio e introduzione della lavorazione dei metalli per ringhiere e balaustre.",
  },
  {
    year: "2000",
    title: "Innovazione",
    description: "Integrazione di nuove tecniche mantenendo la tradizione artigianale che ci contraddistingue.",
  },
  {
    year: "Oggi",
    title: "Eccellenza",
    description: "Oltre 40 anni di esperienza e migliaia di progetti realizzati con la stessa passione del primo giorno.",
  },
]

const values = [
  {
    title: "Artigianalità",
    description: "Ogni pezzo è realizzato a mano con tecniche tradizionali tramandate da generazioni.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: "Qualità",
    description: "Utilizziamo solo materiali selezionati di prima scelta per garantire durabilità e bellezza.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Personalizzazione",
    description: "Ogni progetto è studiato su misura per adattarsi perfettamente ai tuoi spazi e gusti.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    title: "Assistenza",
    description: "Ti seguiamo dalla progettazione all'installazione con supporto tecnico dedicato.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

export default function ChiSiamoPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader
          breadcrumb="Chi Siamo"
          title="La nostra storia, la nostra passione"
          subtitle="Dal 1984 realizziamo scale artigianali su misura, unendo tradizione e innovazione per creare pezzi unici che valorizzano i tuoi spazi."
        />

        {/* Storia Section */}
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                Una tradizione che si rinnova da oltre 40 anni
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                La cooperativa Nuova Misura Scale è nata nel <strong>1984</strong>, con l&apos;intento 
                di fondere l&apos;esperienza di artigiani già operanti da molti anni nel settore della 
                lavorazione del legno, per la quale vengono sfruttate <strong>tecniche e strumentazioni 
                tradizionali</strong>.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Nel tempo la cooperativa si è specializzata nella costruzione di ringhiere per scale 
                in cemento armato di forma curva, realizzando lavori di alto livello qualitativo, 
                curvando corrimano in pezzo unico per ciascuna rampa, con tecniche tradizionali, 
                con <strong>lavorazione manuale</strong> e senza l&apos;impiego di macchine utensili.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Attualmente Nuova Misura Scale mantiene lo stesso livello artigianale nella produzione, 
                garantendo qualità e attenzione ai dettagli in ogni realizzazione.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/team.jpg"
                alt="Il nostro team di artigiani"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Section>

        {/* Timeline Section */}
        <Section variant="muted">
          <SectionHeader
            label="La Nostra Storia"
            title="Tappe fondamentali"
            subtitle="Il nostro percorso di crescita e innovazione, sempre nel rispetto della tradizione artigianale."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <Card key={item.year} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <span className="font-serif text-4xl font-bold text-primary/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-primary">{item.year}</span>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Values Section */}
        <Section>
          <SectionHeader
            label="I Nostri Valori"
            title="Cosa ci rende unici"
            subtitle="I principi che guidano il nostro lavoro ogni giorno."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {value.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Detail Image Section */}
        <Section variant="muted" className="py-0 md:py-0 lg:py-0">
          <div className="relative aspect-[21/9] overflow-hidden rounded-lg mx-4 lg:mx-8">
            <Image
              src="/images/dettaglio.jpg"
              alt="Dettaglio lavorazione artigianale"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-balance">
                  &ldquo;La qualità non è mai un caso, è sempre il risultato di uno sforzo intelligente.&rdquo;
                </p>
                <p className="mt-4 text-white/80">— John Ruskin</p>
              </div>
            </div>
          </div>
        </Section>

        <CTA
          title="Vuoi saperne di più?"
          subtitle="Vieni a trovarci nel nostro laboratorio a Ruvo di Puglia o contattaci per un preventivo gratuito."
          action={{ label: "Contattaci", href: "/contatti" }}
        />
      </main>
      <Footer />
    </>
  )
}
