import { cn } from '@/lib/utils'
import type { ServiceItem } from '../data/services'

type ServiceCardProps = {
  service: ServiceItem
  /** Rang dans la grille : décale l'apparition de 80 ms par carte */
  index: number
}

/**
 * Carte d'un service. Au survol, la pastille passe en violet plein et l'icône joue sa
 * micro-interaction (`anim-*`, landing.css).
 */
export function ServiceCard({ service, index }: ServiceCardProps) {
  const { icon: Icon, title, description, animation } = service

  return (
    <div
      className="reveal group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
      // Style en ligne comme dans le Vue : un utilitaire delay-* serait écrasé par la
      // `transition` de `.reveal` (landing.css, hors @layer)
      style={{ transitionDelay: `${(index + 1) * 80}ms` }}
    >
      <div
        className={cn(
          'mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground',
          animation,
        )}
      >
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
