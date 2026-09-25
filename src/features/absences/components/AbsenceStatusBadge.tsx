import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAbsenceStatusLabel } from '@/utils/absenceFormatters'

type AbsenceStatusBadgeProps = Omit<ComponentProps<typeof Badge>, 'variant' | 'children'> & {
  status?: string
  /**
   * Statut inconnu affiché en ambre, comme « En attente » (dialogs de détail et de suppression
   * du Vue) ; la liste admin l'affiche sans couleur.
   */
  unknownAsPending?: boolean
}

const PENDING_CLASSES = 'border-amber-500/50 text-amber-600 dark:text-amber-400'
const APPROVED_CLASSES = 'border-green-500/50 text-green-600 dark:text-green-400'

/**
 * Badge de statut d'une absence (côté admin et détails) : contour ambre « En attente », vert
 * « Approuvée », rouge plein « Refusée », gris « Annulée » (statut inexistant côté API mais
 * toujours géré par l'interface, 8.3), « Inconnu » sinon.
 */
export function AbsenceStatusBadge({
  status,
  unknownAsPending = false,
  className,
  ...props
}: AbsenceStatusBadgeProps) {
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
      {getAbsenceStatusLabel(status)}
    </Badge>
  )
}
