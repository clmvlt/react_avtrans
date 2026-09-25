import type { ComponentProps } from 'react'
import { Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'

type RelaiBadgeProps = ComponentProps<'span'> & {
  immat: string
}

/** Immatriculation du véhicule relais, en pastille avec l'icône Repeat. */
export function RelaiBadge({ immat, className, ...props }: RelaiBadgeProps) {
  return (
    <span
      title="Véhicule relais"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-foreground uppercase',
        className,
      )}
      {...props}
    >
      <Repeat className="size-3 text-muted-foreground" />
      {immat}
    </span>
  )
}
