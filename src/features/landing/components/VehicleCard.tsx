import type { VehicleItem } from '../data/fleet'
import { formatMeters } from '../lib/formatMeters'

type VehicleCardProps = {
  vehicle: VehicleItem
  /** Rang dans la grille : décale l'apparition de 80 ms par carte */
  index: number
}

/** Fiche d'un véhicule de la flotte : photo, badge, description, cotes (`<dl>`) et équipements. */
export function VehicleCard({ vehicle, index }: VehicleCardProps) {
  const BadgeIcon = vehicle.badgeIcon

  return (
    <article
      className="reveal group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
      // Style en ligne comme dans le Vue : un utilitaire delay-* serait écrasé par la
      // `transition` de `.reveal` (landing.css, hors @layer)
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Photo du véhicule */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-linear-to-b from-muted to-card p-6">
        <img
          src={vehicle.image}
          alt={vehicle.alt}
          width={vehicle.width}
          height={vehicle.height}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Caractéristiques */}
      <div className="flex flex-1 flex-col p-8">
        <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wider text-primary-foreground uppercase">
          <BadgeIcon className="size-3.5" />
          {vehicle.badge}
        </span>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{vehicle.title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{vehicle.description}</p>

        {/* Cotes */}
        <dl className="mb-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-muted/40 text-center">
          <div className="px-2 py-2.5">
            <dt className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              Longueur
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold text-foreground">
              {formatMeters(vehicle.lengthM)}
            </dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              Hauteur
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold text-foreground">
              {formatMeters(vehicle.heightM)}
            </dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              Volume
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold text-primary">{vehicle.volume}</dd>
          </div>
        </dl>

        <ul className="mt-auto space-y-3">
          {vehicle.specs.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
