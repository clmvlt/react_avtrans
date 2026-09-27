import { ChevronRight, CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AbsenceDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatHeures } from '../../lib/absenceDecompte'
import {
  calculateAbsenceDuration,
  getAbsenceStatusClasses,
  getAbsenceStatusLabel,
} from '@/utils/absenceFormatters'

type MyAbsenceCardProps = {
  absence: AbsenceDTO
  onOpen: (absence: AbsenceDTO) => void
  onCancel: (absence: AbsenceDTO) => void
}

const parseDate = (value?: string | Date): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatShort = (date: Date | null) =>
  date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'

const formatLong = (date: Date | null) =>
  date ? date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'

/**
 * Carte d'une demande d'absence (port de `MyAbsenceCard.vue`) : tuile de date teintée de la
 * couleur du type, type, statut, période et durée, heures créditées (D8), motif, motif du refus ;
 * pied « Annuler » pour une demande en attente.
 */
export function MyAbsenceCard({ absence, onOpen, onCancel }: MyAbsenceCardProps) {
  const start = parseDate(absence.startDate)
  const end = parseDate(absence.endDate)
  const rangeLabel =
    absence.startDate === absence.endDate
      ? formatLong(start)
      : `${formatShort(start)} → ${formatShort(end)}`
  const typeName = absence.absenceType?.name || absence.customType || 'Absence'
  const color = absence.absenceType?.color
  const createdAt = parseDate(absence.createdAt)
  const requestedAt = createdAt
    ? createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : ''

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary/40">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left transition-colors active:bg-accent/40 sm:p-4"
        aria-label={`Détails : ${typeName}, ${rangeLabel}`}
        onClick={() => onOpen(absence)}
      >
        <div
          className="flex w-14 shrink-0 flex-col items-center justify-center self-stretch rounded-lg bg-primary/10 py-1.5 text-primary"
          style={color ? { backgroundColor: `${color}1f`, color } : undefined}
        >
          <span className="text-xl leading-none font-bold tabular-nums">
            {start ? String(start.getDate()) : '--'}
          </span>
          <span className="mt-1 text-[11px] leading-none font-semibold uppercase">
            {start ? start.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') : ''}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-foreground">{typeName}</p>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                getAbsenceStatusClasses(absence.status),
              )}
            >
              {getAbsenceStatusLabel(absence.status)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            <span className="capitalize">{rangeLabel}</span> ·{' '}
            {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
            {(absence.heures ?? 0) > 0 && ` · ${formatHeures(absence.heures)}`}
          </p>
          {absence.reason && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{absence.reason}</p>
          )}
          {absence.status === 'REJECTED' && absence.rejectionReason && (
            <p className="mt-1 line-clamp-1 text-xs text-destructive">
              Refus : {absence.rejectionReason}
            </p>
          )}
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
      </button>

      {absence.status === 'PENDING' && (
        <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 sm:px-4">
          <span className="text-xs text-muted-foreground">
            {requestedAt && `Demandé le ${requestedAt}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onCancel(absence)}
          >
            <CircleX className="size-4" />
            Annuler
          </Button>
        </div>
      )}
    </article>
  )
}
