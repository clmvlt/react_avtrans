import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type VehicleFactCardProps = Omit<ComponentProps<'div'>, 'children'> & {
  icon: LucideIcon
  label: string
  /** Valeur mise en avant (kilométrage, date d'échéance…). */
  value: ReactNode
  /** Classes de la valeur (couleur d'une échéance, texte grisé si non renseignée…). */
  valueClassName?: string
  /** Précision sous la valeur (état d'une échéance, « Dernier relevé »…). */
  hint?: ReactNode
  hintClassName?: string
  /** Bouton en pied de carte (« Ajouter un relevé »). */
  action?: ReactNode
}

/** Carte d'une information clé, en tête de la fiche véhicule : libellé, valeur, précision, action. */
export function VehicleFactCard({
  icon: Icon,
  label,
  value,
  valueClassName,
  hint,
  hintClassName,
  action,
  className,
  ...props
}: VehicleFactCardProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-xl border bg-card p-4', className)} {...props}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className={cn('text-lg font-semibold text-foreground', valueClassName)}>{value}</p>
      {hint && <p className={cn('text-xs text-muted-foreground', hintClassName)}>{hint}</p>}
      {action && <div className="mt-auto pt-2">{action}</div>}
    </div>
  )
}
