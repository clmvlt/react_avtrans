import type { CSSProperties } from 'react'
import type { AbsenceDTO } from '@/models'
import type { PlanningDate } from './planningDates'

/** `#RRGGBB` → `rgba(r, g, b, opacity)`. */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/** Classes d'une cellule jour × employé (getDayCellClass du Vue). */
export function getDayCellClasses(absence: AbsenceDTO | undefined, date: PlanningDate): string[] {
  const classes: string[] = []

  if (!absence) {
    if (date.isToday) classes.push('bg-primary/10')
    if (date.isWeekend && !date.isToday) classes.push('bg-muted/50')
    if (date.isHoliday && !date.isToday) classes.push('bg-destructive/5')
    return classes
  }

  classes.push('cursor-pointer', 'hover:brightness-95')
  if (!absence.absenceType?.color && absence.status) {
    switch (absence.status) {
      case 'APPROVED':
        classes.push('bg-emerald-500/15')
        break
      case 'PENDING':
        classes.push('bg-amber-500/15')
        break
      case 'REJECTED':
        classes.push('bg-muted')
        break
    }
  }
  return classes
}

/**
 * Couleur du type d'absence (valeur dynamique, d'où le style inline) : 0,25 si approuvée,
 * 0,15 sinon ; demi-journée en dégradé haut (matin) ou bas (après-midi).
 */
export function getDayCellStyle(absence: AbsenceDTO | undefined): CSSProperties | undefined {
  if (!absence?.absenceType?.color) return undefined

  const opacity = absence.status === 'APPROVED' ? 0.25 : 0.15
  const color = hexToRgba(absence.absenceType.color, opacity)

  if (absence.period === 'MORNING') {
    return { background: `linear-gradient(to bottom, ${color} 50%, transparent 50%)` }
  }
  if (absence.period === 'AFTERNOON') {
    return { background: `linear-gradient(to bottom, transparent 50%, ${color} 50%)` }
  }
  return { backgroundColor: color }
}

/** Couleur du symbole de statut. */
export function getAbsenceIconStyle(absence: AbsenceDTO | undefined): CSSProperties | undefined {
  if (!absence) return undefined

  if (absence.status === 'APPROVED' && absence.absenceType?.color) {
    return { color: absence.absenceType.color }
  }

  switch (absence.status) {
    case 'APPROVED':
      return { color: '#16a34a' }
    case 'PENDING':
      return { color: '#d97706' }
    case 'REJECTED':
      return { color: '#dc2626' }
    default:
      return undefined
  }
}

/** Symbole de statut : ✓ approuvée, ? en attente, ✗ refusée. */
export function getAbsenceIcon(absence: AbsenceDTO | undefined | null): string {
  if (!absence) return ''
  switch (absence.status) {
    case 'APPROVED':
      return '✓'
    case 'PENDING':
      return '?'
    case 'REJECTED':
      return '✗'
    default:
      return ''
  }
}
