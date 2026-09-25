import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAcompteStatusLabel } from '@/utils/acompteFormatters'

type AcompteStatusBadgeProps = Omit<ComponentProps<typeof Badge>, 'variant' | 'children'> & {
  status?: string
  /** Statut inconnu affiché en ambre (détail employé du Vue) ; sans couleur ailleurs. */
  unknownAsPending?: boolean
}

const PENDING_CLASSES = 'border-amber-500/50 text-amber-600 dark:text-amber-400'
const APPROVED_CLASSES = 'border-green-500/50 text-green-600 dark:text-green-400'

/**
 * Badge de statut d'un acompte : contour ambre « En attente », vert « Approuvé », rouge plein
 * « Refusé », gris « Annulé » (statut inexistant côté API mais géré par l'interface, 8.3).
 */
export function AcompteStatusBadge({
  status,
  unknownAsPending = false,
  className,
  ...props
}: AcompteStatusBadgeProps) {
  const variant =
    status === 'REJECTED' ? 'destructive' : status === 'CANCELLED' ? 'secondary' : 'outline'
  const statusClasses =
    status === 'PENDING'
      ? PENDING_CLASSES
      : status === 'APPROVED'
        ? APPROVED_CLASSES
        : unknownAsPending && status !== 'REJECTED' && status !== 'CANCELLED'
          ? PENDING_CLASSES
          : undefined

  return (
    <Badge variant={variant} className={cn(statusClasses, className)} {...props}>
      {getAcompteStatusLabel(status)}
    </Badge>
  )
}
