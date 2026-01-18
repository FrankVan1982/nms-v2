import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeader } from "@/components/sections/page-header"
import { Section } from "@/components/ui/section"
import { ContactForm } from "@/components/forms/contact-form"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contatti | Nuova Misura Scale",
  description: "Contatta Nuova Misura Scale per un preventivo gratuito. Siamo a Ruvo di Puglia (BA), sulla SP85 per Bisceglie. Tel: +39 080 3629757",
}

const contactInfo = [
  {
    title: "Indirizzo",
    content: "SP85 per Bisceglie, Km 11.900\n70037 Ruvo di Puglia (BA)",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Telefono",
    content: "+39 080 3629757\n+39 349 0627401",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    href: "tel:+390803629757",
  },
  {
    title: "Email",
    content: "nuovamisurascale@libero.it",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    href: "mailto:nuovamisurascale@libero.it",
  },
  {
    title: "Orari",
    content: "Lun - Ven: 08:00 - 18:00\nSab: 08:00 - 12:00",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function ContattiPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader
          breadcrumb="Contatti"
          title="Parliamo del tuo progetto"
          subtitle="Siamo a tua disposizione per fornirti tutte le informazioni di cui hai bisogno e per accompagnarti nella realizzazione delle tue scale da sogno."
        />

        <Section>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                Richiedi un preventivo gratuito
              </h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                I nostri recapiti
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {contactInfo.map((info) => (
                  <Card key={info.title}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{info.title}</h3>
                          {info.href ? (
                            <a
                              href={info.href}
                              className="mt-1 text-sm text-muted-foreground hover:text-primary whitespace-pre-line"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                              {info.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">Come raggiungerci</h3>
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3006.123456789!2d16.45!3d41.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRuvo+di+Puglia!5e0!3m2!1sit!2sit!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mappa Nuova Misura Scale"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Il nostro laboratorio si trova sulla SP85 per Bisceglie, al Km 11.900, 
                  nel comune di Ruvo di Puglia (BA). Facilmente raggiungibile dalla SS16 
                  e dalla A14.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section variant="muted">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-8">
              Domande frequenti
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Quanto tempo richiede la realizzazione di una scala su misura?",
                  a: "I tempi variano in base alla complessità del progetto. Generalmente, dalla conferma dell'ordine alla consegna passano 4-8 settimane."
                },
                {
                  q: "Fornite anche il servizio di installazione?",
                  a: "Sì, offriamo un servizio completo che include progettazione, realizzazione e installazione. Il nostro team si occupa di tutto."
                },
                {
                  q: "È possibile vedere dei campioni prima di ordinare?",
                  a: "Certamente! Vi invitiamo a visitare il nostro laboratorio dove potrete vedere materiali, finiture e alcune realizzazioni."
                },
                {
                  q: "Offrite preventivi gratuiti?",
                  a: "Sì, il preventivo è sempre gratuito e senza impegno. Dopo un sopralluogo, vi forniremo un preventivo dettagliato."
                },
              ].map((faq) => (
                <div key={faq.q} className="rounded-lg border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  )
}
