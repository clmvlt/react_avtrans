import { Container } from 'lucide-react'
import porteurImg from '@/assets/images/porteur.webp'
import type { HeavyService } from '../data/services'

type HeavyServiceCardProps = {
  service: HeavyService
}

/** Carte mise en avant de la grille services : livraison en poids lourd (2 colonnes dès `sm`). */
export function HeavyServiceCard({ service }: HeavyServiceCardProps) {
  return (
    <article className="reveal group relative overflow-hidden rounded-2xl border border-primary/20 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 sm:col-span-2">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
      <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wider text-primary-foreground uppercase">
            <Container className="size-3.5" />
            {service.badge}
          </span>
          <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {service.title}
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
          <ul className="space-y-3">
            {service.points.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-medium text-foreground"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img
            src={porteurImg}
            alt="Porteur poids lourd AVTRANS Concept — livraison de palettes et fret en Bretagne"
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="size-full object-cover drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
    </article>
  )
}
