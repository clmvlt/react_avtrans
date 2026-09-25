import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type InfoTileProps = {
  icon: LucideIcon
  label: string
  children: ReactNode
  /** Classes de la valeur (police mono du VIN, couleur d'une échéance…). */
  valueClassName?: string
}

/** Tuile grisée « icône + libellé » puis valeur, dans la fiche du véhicule. */
export function InfoTile({ icon: Icon, label, children, valueClassName }: InfoTileProps) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <p className={cn('mt-0.5 text-sm font-medium text-foreground', valueClassName)}>{children}</p>
    </div>
  )
}
