import { cn } from '@/lib/utils'
import { STATUS_PILL_CLASS_NAME, STATUS_TEXT, type PointageStatus } from '../lib/pointageStatus'

type StatusPillProps = {
  status: PointageStatus
}

/** Pastille d'état de la carte (point animé en service et en pause). */
export function StatusPill({ status }: StatusPillProps) {
  const dotColor =
    status === 'working'
      ? 'bg-green-500'
      : status === 'break'
        ? 'bg-amber-500'
        : 'bg-muted-foreground/50'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        STATUS_PILL_CLASS_NAME[status],
      )}
    >
      <span className="relative flex size-2">
        {status !== 'off' && (
          <span
            className={cn(
              'absolute inline-flex size-full animate-ping rounded-full opacity-60',
              status === 'working' ? 'bg-green-500' : 'bg-amber-500',
            )}
          />
        )}
        <span className={cn('relative inline-flex size-2 rounded-full', dotColor)} />
      </span>
      {STATUS_TEXT[status]}
    </span>
  )
}
