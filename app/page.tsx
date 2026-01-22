import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { CTA } from "@/components/sections/cta"
import { Section, SectionHeader } from "@/components/ui/section"
import { ServiceCard } from "@/components/ui/service-card"
import { FeatureCard } from "@/components/ui/feature-card"
import Image from "next/image"

const services = [
  {
    title: "Scale a Chiocciola",
    description: "Eleganti scale elicoidali in legno e metallo, progettate per ottimizzare lo spazio senza rinunciare al design.",
    image: "/images/scale-chiocciola.jpg",
    href: "/lavorazioni#scale-chiocciola",
  },
  {
    title: "Scale a Giorno",
    description: "Scale moderne con gradini a sbalzo, perfette per ambienti contemporanei che richiedono luminosità.",
    image: "/images/scale-giorno.jpg",
    href: "/lavorazioni#scale-giorno",
  },
  {
    title: "Ringhiere e Balaustre",
    description: "Creazioni artigianali in ferro battuto e legno, dalla tradizione classica al design moderno.",
    image: "/images/ringhiere.jpg",
    href: "/lavorazioni#ringhiere",
  },
  {
    title: "Rivestimenti",
    description: "Rivestimenti in legno pregiato per scale esistenti, per rinnovare e valorizzare i tuoi spazi.",
    image: "/images/rivestimenti.jpg",
    href: "/lavorazioni#rivestimenti",
  },
]

const features = [
  {
    number: "01",
    title: "Tradizione Artigianale",
    description: "Dal 1984 portiamo avanti la tradizione della lavorazione artigianale del legno e del metallo con tecniche tramandate da generazioni.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Soluzioni Su Misura",
    description: "Ogni progetto è unico. Progettiamo e realizziamo scale personalizzate che si adattano perfettamente ai tuoi spazi e alle tue esigenze.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Materiali di Qualità",
    description: "Utilizziamo solo legni pregiati e metalli di prima scelta per garantire durabilità e bellezza nel tempo.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Assistenza Completa",
    description: "Ti accompagniamo dalla progettazione all'installazione, offrendo consulenza tecnica e supporto continuo.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Hero
          title="Scale Artigianali"
          highlight="Su Misura"
          subtitle="Cooperativa artigianale specializzata nella fabbricazione di scale a giorno, scale a chiocciola in legno e metallo, ringhiere e balaustre. Dal 1984, realizziamo i tuoi progetti con passione e maestria."
          image="/images/hero-scale.jpg"
          primaryAction={{ label: "Richiedi preventivo", href: "/contatti" }}
          secondaryAction={{ label: "Scopri le lavorazioni", href: "/galleria" }}
        >
        </Hero>

        {/* About Preview Section */}
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Chi siamo
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                40 anni di esperienza nella lavorazione artigianale
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                La cooperativa Nuova Misura Scale è nata nel <strong>1984</strong>, con l&apos;intento 
                di fondere l&apos;esperienza di artigiani già operanti da molti anni nel settore della 
                lavorazione del legno e del ferro.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Utilizziamo tecniche e strumentazioni tradizionali che garantiscono lavorazioni 
                di pregio, curvando corrimano in pezzo unico per ciascuna rampa, con lavorazione 
                manuale e senza l&apos;impiego di macchine utensili.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                <div>
                  <span className="font-serif text-4xl font-bold text-primary">40+</span>
                  <p className="text-sm text-muted-foreground">Anni di esperienza</p>
                </div>
                <div>
                  <span className="font-serif text-4xl font-bold text-primary">1000+</span>
                  <p className="text-sm text-muted-foreground">Progetti realizzati</p>
                </div>
                <div>
                  <span className="font-serif text-4xl font-bold text-primary">100%</span>
                  <p className="text-sm text-muted-foreground">Su misura</p>
                </div>
              </div>
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-lg lg:order-2">
              <Image
                src="/images/laboratorio.jpg"
                alt="Laboratorio artigianale"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Section>

        {/* Services Section */}
        <Section variant="muted">
          <SectionHeader
            label="Le Nostre lavorazioni"
            labelColor="text-tertiary-500"
            title="Soluzioni artigianali per ogni esigenza"
            subtitle="Dalla progettazione alla realizzazione, offriamo un servizio completo per trasformare i tuoi spazi con scale e ringhiere su misura."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </Section>

        {/* Features Section */}
        <Section>
          <SectionHeader
            label="Perché Sceglierci"
            title="Qualità e tradizione al tuo servizio"
            subtitle="Ogni scala che realizziamo è un pezzo unico, creato con passione e attenzione ai dettagli."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Section>

        {/* CTA Section */}
        <CTA
          title="Pronto a realizzare la tua scala dei sogni?"
          subtitle="Contattaci per un preventivo gratuito e senza impegno. Ti accompagneremo in ogni fase del progetto."
          action={{ label: "Contattaci Ora", href: "/contatti" }}
        />
      </main>
      <Footer />
    </>
  )
}
