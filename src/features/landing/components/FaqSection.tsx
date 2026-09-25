import { ChevronDown, CircleHelp } from 'lucide-react'
import { faq } from '../data/faq'
import { SectionHeading } from './SectionHeading'

/**
 * Questions fréquentes en `<details>` natif (et non l'accordion Radix, qui démonte le contenu
 * fermé) : les réponses restent dans le HTML pré-rendu, indexables et lisibles sans JavaScript.
 */
export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-background py-24 sm:py-32"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={CircleHelp}
          badge="Questions fréquentes"
          title="Vos questions sur nos services de transport"
          titleId="faq-title"
          className="mb-12 sm:mb-16"
        >
          Zones desservies, marchandises acceptées, véhicules, devis : l'essentiel à savoir avant de
          confier vos envois à AVTRANS Concept.
        </SectionHeading>

        <div className="reveal mx-auto max-w-3xl space-y-4">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-border bg-card transition-colors open:border-primary/30 open:shadow-lg open:shadow-primary/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
