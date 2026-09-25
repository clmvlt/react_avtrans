import type { ReactNode } from 'react'

type InfoTileProps = {
  label: string
  /** Valeur affichée en texte ; ou `children` pour un contenu riche (badge) */
  value?: ReactNode
  children?: ReactNode
}

/** Case « libellé / valeur » des vues en lecture de /profile. */
export function InfoTile({ label, value, children }: InfoTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-background p-3">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children ?? <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  )
}
