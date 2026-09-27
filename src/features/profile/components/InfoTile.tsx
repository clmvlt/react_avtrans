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
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children ?? <span className="text-sm font-medium break-words text-foreground">{value}</span>}
    </div>
  )
}
