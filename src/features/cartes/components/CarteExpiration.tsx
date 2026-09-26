import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatExpirationDate, getExpirationStatus } from '../lib/cartes'

type CarteExpirationProps = {
  dateExpiration: string
  /** Version des cartes mobiles (date en `text-sm`). */
  compact?: boolean
}

/**
 * Échéance d'une carte : badge rouge « Expirée », badge orange « Expire bientôt » (moins de
 * 30 jours), sinon la date.
 */
export function CarteExpiration({ dateExpiration, compact = false }: CarteExpirationProps) {
  const status = getExpirationStatus(dateExpiration)

  return (
    <div className="flex items-center gap-1.5">
      <CalendarClock className={cn('size-3.5', status?.className)} />
      {status?.badge ? (
        <Badge variant={status.badge}>{status.label}</Badge>
      ) : (
        <span className={cn(compact && 'text-sm', status?.className)}>
          {formatExpirationDate(dateExpiration)}
        </span>
      )}
    </div>
  )
}
