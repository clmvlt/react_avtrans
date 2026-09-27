import type { CSSProperties } from 'react'
import { formatHeures } from '@/features/absences/lib/absenceDecompte'
import type { AbsenceDTO } from '@/models'
import { cn } from '@/lib/utils'
import type { PlanningAbsenceDay } from './absenceDays'
import type { PlanningDate, PlanningDensity } from './planningDates'

/** Couleur d'une absence sans type (type personnalisé). */
const FALLBACK_COLOR = '#64748b'

/** `#RRGGBB` → `rgba(r, g, b, opacity)`. */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const getAbsenceColor = (absence: AbsenceDTO) =>
  /^#[0-9A-Fa-f]{6}$/.test(absence.absenceType?.color ?? '')
    ? (absence.absenceType?.color as string)
    : FALLBACK_COLOR

export const getAbsenceTypeName = (absence: AbsenceDTO) =>
  absence.absenceType?.name || absence.customType || 'Absence'

/** Fond d'une colonne de jour : aujourd'hui, férié (hachures), week-end. */
export function getDayColumnClass(date: PlanningDate): string {
  return cn(
    date.isHoliday && 'bg-hatch-holiday',
    !date.isHoliday && date.isWeekend && 'bg-muted/60',
    date.isToday && 'bg-primary/10',
  )
}

/**
 * Teinte d'une couleur de type : `strength` est une variable CSS de la grille
 * (`--planning-bar-fill`, `--planning-bar-faint`), plus forte en mode sombre.
 */
const tint = (color: string, strength: string) =>
  `color-mix(in srgb, ${color} ${strength}, transparent)`

/**
 * Couleurs de la barre d'un jour d'absence (valeurs dynamiques, d'où le style inline) : teinte
 * pleine si approuvée, hachures si en attente, teinte pâle pour le samedi de reprise, trait pour
 * un jour non décompté.
 */
export function getAbsenceBarStyle(day: PlanningAbsenceDay): CSSProperties {
  const color = getAbsenceColor(day.absence)
  const border = hexToRgba(color, 0.9)
  if (day.kind === 'non-decompte') return { backgroundColor: hexToRgba(color, 0.6) }
  if (day.kind === 'reprise') {
    return { backgroundColor: tint(color, 'var(--planning-bar-faint)'), borderColor: border }
  }
  if (day.absence.status === 'PENDING') {
    return {
      backgroundImage: `repeating-linear-gradient(135deg, ${tint(color, 'var(--planning-bar-fill)')} 0 3px, ${tint(color, 'var(--planning-bar-faint)')} 3px 6px)`,
      borderColor: border,
    }
  }
  return { backgroundColor: tint(color, 'var(--planning-bar-fill)'), borderColor: border }
}

const VERTICAL: Record<PlanningDensity, string> = {
  week: 'inset-y-1.5',
  month: 'inset-y-1',
  dense: 'inset-y-0.5',
}

/**
 * Position de la barre dans la case : pleine hauteur ou moitié (matin en haut, après-midi en
 * bas), prolongée sous la bordure de gauche quand l'absence continue, coins arrondis au début et
 * à la fin seulement.
 */
export function getAbsenceBarClass(day: PlanningAbsenceDay, density: PlanningDensity): string {
  const horizontal = cn(day.isStart ? 'left-0.5' : '-left-px', day.isEnd ? 'right-0.5' : 'right-0')
  if (day.kind === 'non-decompte') {
    return cn(
      'absolute top-1/2 h-0.5 -translate-y-1/2',
      horizontal,
      day.isStart && 'rounded-l-full',
      day.isEnd && 'rounded-r-full',
    )
  }
  const period = day.kind === 'reprise' ? 'FULL_DAY' : (day.absence.period ?? 'FULL_DAY')
  return cn(
    'absolute overflow-hidden border-y',
    horizontal,
    period === 'MORNING' && 'top-1 bottom-1/2',
    period === 'AFTERNOON' && 'top-1/2 bottom-1',
    period === 'FULL_DAY' && VERTICAL[density],
    day.isStart && 'rounded-l-[4px] border-l',
    day.isEnd && 'rounded-r-[4px] border-r',
    (day.kind === 'reprise' || day.absence.status === 'PENDING') && 'border-dashed',
  )
}

const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'approuvée',
  PENDING: 'en attente',
  REJECTED: 'refusée',
}

/** Info-bulle d'une case (attribut `title`, léger pour des centaines de cases). */
export function getDayCellTitle(
  userName: string,
  date: PlanningDate,
  day: PlanningAbsenceDay | undefined,
): string {
  const holiday = date.holidayName ? ` · Férié : ${date.holidayName}` : ''
  if (!day) return `${userName} · ${date.label}${holiday}`

  const status = STATUS_LABELS[day.absence.status ?? ''] ?? ''
  const head = `${userName} · ${getAbsenceTypeName(day.absence)}${status ? ` (${status})` : ''} · ${date.label}`
  switch (day.kind) {
    case 'non-decompte': {
      const reason =
        day.motif === 'FERIE'
          ? `férié (${date.holidayName ?? ''})`
          : day.motif === 'SAMEDI'
            ? 'samedi'
            : 'dimanche'
      return `${head} : ${reason}, non décompté`
    }
    case 'reprise':
      return `${head} : samedi avant la reprise, décompté, ${formatHeures(day.heures)}`
    default:
      return `${head} : ${day.fraction === 0.5 ? 'demi-journée, ' : ''}décompté, ${formatHeures(day.heures)}${holiday}`
  }
}
