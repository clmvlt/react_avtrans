import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CouchetteDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatDayLong, formatDeclaredAt, getDayNumber, getDayShort } from '../lib/couchetteDates'

type CouchetteHistoryItemProps = {
  couchette: CouchetteDTO
  /** Nuit de ce soir : en vert, seule supprimable (contrainte de l'API). */
  isToday: boolean
  onDelete: (couchette: CouchetteDTO) => void
}

/** Une nuit de l'historique : tuile de date, libellé, date de déclaration. */
export function CouchetteHistoryItem({ couchette, isToday, onDelete }: CouchetteHistoryItemProps) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm',
        isToday && 'border-green-500/40',
      )}
    >
      {/* Tuile de date */}
      <div
        className={cn(
          'flex w-14 shrink-0 flex-col items-center justify-center rounded-lg py-1.5',
          isToday
            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
            : 'bg-primary/10 text-primary',
        )}
      >
        <span className="text-xl leading-none font-bold tabular-nums">
          {getDayNumber(couchette.date)}
        </span>
        <span className="mt-1 text-[11px] leading-none font-semibold uppercase">
          {getDayShort(couchette.date)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground capitalize">
          {isToday ? "Aujourd'hui" : formatDayLong(couchette.date)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Déclarée le {formatDeclaredAt(couchette.createdAt)}
        </p>
      </div>

      {isToday && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Supprimer la couchette du jour"
          onClick={() => onDelete(couchette)}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </li>
  )
}
