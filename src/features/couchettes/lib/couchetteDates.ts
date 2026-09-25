import type { CouchetteDTO } from '@/models'

/**
 * Dates des couchettes, reprises telles quelles du Vue. `date` est une clé `YYYY-MM-DD` que le
 * Vue relit avec `new Date(...)`, donc à minuit UTC (sans effet en France, décalage d'un jour
 * possible dans un fuseau négatif : bug de l'annexe conservé).
 */

/** `new Date(value)` ou `null` si la valeur est absente ou invalide (`parseDate` de MesCouchettes). */
export function parseCouchetteDate(value?: string | Date): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// ---------------------------------------------------------------------------
// Vue admin (Couchettes.vue et ses dialogs)
// ---------------------------------------------------------------------------

/** « 25 septembre 2026 » (ou « - »). */
export function formatCouchetteDate(value?: string | Date): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « 25 sept. 2026, 14:03 » (ou « - »). */
export function formatCouchetteDateTime(value?: string | Date): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** « 1 sept. » : dates du texte des filtres actifs. */
export function formatFilterDate(value: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ---------------------------------------------------------------------------
// Mes couchettes (MesCouchettes.vue)
// ---------------------------------------------------------------------------

/** « jeudi 25 septembre » (ou « - »). */
export function formatDayLong(value?: string | Date): string {
  const date = parseCouchetteDate(value)
  if (!date) return '-'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** « 25 sept., 14:03 » (sans l'année, ou « - »). */
export function formatDeclaredAt(value?: string | Date): string {
  const date = parseCouchetteDate(value)
  if (!date) return '-'
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Numéro du jour de la tuile de date (« 25 », ou « -- »). */
export function getDayNumber(value?: string): string {
  const date = parseCouchetteDate(value)
  return date ? String(date.getDate()) : '--'
}

/** Jour abrégé de la tuile de date (« jeu »). */
export function getDayShort(value?: string): string {
  const date = parseCouchetteDate(value)
  return date ? date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '') : ''
}

/**
 * Nuits du mois courant **parmi les couchettes de la page chargée** (bug B-10 reproduit : faux
 * hors page 0 ou au-delà de 20 nuits dans le mois).
 */
export function countCurrentMonth(couchettes: CouchetteDTO[]): number {
  const now = new Date()
  return couchettes.filter((couchette) => {
    const date = parseCouchetteDate(couchette.date)
    return !!date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
}

export type CouchetteMonthGroup = {
  /** `YYYY-MM` */
  key: string
  /** « septembre 2026 » */
  label: string
  items: CouchetteDTO[]
}

/** Historique groupé par mois, du plus récent au plus ancien (mois et nuits). */
export function groupCouchettesByMonth(couchettes: CouchetteDTO[]): CouchetteMonthGroup[] {
  const groups = new Map<string, CouchetteMonthGroup>()

  for (const couchette of couchettes) {
    const date = parseCouchetteDate(couchette.date)
    if (!date) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    let group = groups.get(key)
    if (!group) {
      group = {
        key,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        items: [],
      }
      groups.set(key, group)
    }
    group.items.push(couchette)
  }

  for (const group of groups.values()) {
    group.items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }

  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key))
}

/** « 1 nuit », « 12 nuits ». */
export function formatNights(count: number): string {
  return `${count} nuit${count > 1 ? 's' : ''}`
}
