import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ContactCardProps = {
  icon: LucideIcon
  title: string
  /** Coordonnée affichée sous le titre (lien tel:, adresse…) */
  children: ReactNode
}

/** Carte de coordonnées de la section contact (téléphone, mobile, adresse). */
export function ContactCard({ icon: Icon, title, children }: ContactCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </div>
  )
}
