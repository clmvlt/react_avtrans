import { useDayKey } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isPeriodRunning, livePeriodSeconds } from '@/lib/liveCounter'
import { cn } from '@/lib/utils'
import type { DirectoryEntry } from '../lib/employeeDirectory'
import { formatDayHours } from '../lib/formatters'
import { describePresence, PRESENCE_TEXT_CLASSES } from '../lib/presence'
import { EmployeeAvatar } from './EmployeeAvatar'

type DirectoryCardProps = {
  entry: DirectoryEntry
  /** Réception des présences : les heures du jour avancent en direct */
  receivedAt: number
  onSelect: (userUuid: string) => void
}

/** Carte d'un employé dans l'annuaire de la fiche : photo, nom, présence et heures du jour. */
export function DirectoryCard({ entry, receivedAt, onSelect }: DirectoryCardProps) {
  const todayKey = useDayKey()
  const hoursToday = entry.status?.hoursToday
  const elapsed = useLiveElapsed(receivedAt, isPeriodRunning(hoursToday))
  const todayLabel = formatDayHours(livePeriodSeconds(hoursToday, elapsed))

  return (
    <button
      type="button"
      onClick={() => entry.user.uuid && onSelect(entry.user.uuid)}
      className="flex h-full flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <EmployeeAvatar user={entry.user} presence={entry.presence} size="xl" />
      <span className="w-full min-w-0">
        <span className="block truncate font-medium text-foreground">{entry.user.firstName}</span>
        <span className="block truncate text-sm text-muted-foreground">{entry.user.lastName}</span>
      </span>
      <span className={cn('w-full truncate text-xs', PRESENCE_TEXT_CLASSES[entry.presence])}>
        {describePresence(entry.presence, entry.status, todayKey)}
      </span>
      {todayLabel && (
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground tabular-nums">
          {todayLabel} aujourd&apos;hui
        </span>
      )}
    </button>
  )
}
