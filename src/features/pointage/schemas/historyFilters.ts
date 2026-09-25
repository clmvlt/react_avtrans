import { z } from 'zod'

/** Filtres de l'historique (Sheet « Filtrer l'historique »). Aucune validation, comme le Vue. */
export const historyFiltersSchema = z.object({
  /** `YYYY-MM-DD` ou vide */
  startDate: z.string(),
  /** `YYYY-MM-DD` ou vide (jour inclus : le service ajoute +1 jour) */
  endDate: z.string(),
  type: z.enum(['all', 'service', 'pause']),
})

export type HistoryFilters = z.infer<typeof historyFiltersSchema>

export const EMPTY_HISTORY_FILTERS: HistoryFilters = { startDate: '', endDate: '', type: 'all' }

export const HISTORY_TYPE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'service', label: 'Services' },
  { value: 'pause', label: 'Pauses' },
]

/** Filtre `isBreak` envoyé à l'API : `undefined` = tout. */
export function toIsBreak(type: HistoryFilters['type']): boolean | undefined {
  if (type === 'pause') return true
  if (type === 'service') return false
  return undefined
}

/** Nombre de filtres actifs (badge du bouton « Filtres »). */
export function countActiveFilters(filters: HistoryFilters): number {
  let n = 0
  if (filters.startDate) n++
  if (filters.endDate) n++
  if (filters.type !== 'all') n++
  return n
}
