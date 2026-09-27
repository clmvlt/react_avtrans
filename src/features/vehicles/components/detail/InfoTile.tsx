import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type InfoTileProps = {
  icon: LucideIcon
  label: string
  children: ReactNode
  /** Classes du conteneur (largeur dans la grille…). */
  className?: string
  /** Classes de la valeur (police mono du VIN…). */
  valueClassName?: string
}

/** Paire « libellé / valeur » de la fiche du véhicule, à placer dans un `<dl>`. */
export function InfoTile({
  icon: Icon,
  label,
  children,
  className,
  valueClassName,
}: InfoTileProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span>{label}</span>
      </dt>
      <dd className={cn('mt-0.5 text-sm font-medium break-words text-foreground', valueClassName)}>
        {children}
      </dd>
    </div>
  )
}
