/**
 * Périodes de l'export des heures (ExportHours.vue).
 *
 * ⚠ Bug B-01 reproduit (MIGRATION.md 8.2, correction NON autorisée à ce jour) : les dates sont
 * converties par `toISOString()`, donc en UTC, à partir d'un minuit **local**. En France, toutes
 * les bornes sont décalées d'un jour en arrière : le mois courant part du 31 août au 29 septembre
 * au lieu du 1er au 30 septembre, et les préréglages sont faux de la même façon. Correction
 * prévue le jour où elle sera autorisée : `toLocalDateKey` de `src/lib/dates.ts`.
 */

export type ExportPeriodPreset = 'thisMonth' | 'lastMonth' | 'thisYear' | 'last30Days'

export const EXPORT_PERIOD_PRESETS: { value: ExportPeriodPreset; label: string }[] = [
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'thisYear', label: 'Cette année' },
  { value: 'last30Days', label: '30 derniers jours' },
]

/** `formatDateToISO` du Vue : `YYYY-MM-DD` en UTC (B-01). */
const formatDateToISO = (date: Date): string => date.toISOString().split('T')[0] ?? ''

export type ExportPeriod = { startDate: string; endDate: string }

/** Période par défaut : le mois courant (décalé d'un jour par B-01). */
export function getDefaultExportPeriod(): ExportPeriod {
  return getExportPresetPeriod('thisMonth')
}

export function getExportPresetPeriod(preset: ExportPeriodPreset): ExportPeriod {
  const now = new Date()
  let start: Date
  let end: Date

  switch (preset) {
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      break
    case 'last30Days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      end = now
      break
  }

  return { startDate: formatDateToISO(start), endDate: formatDateToISO(end) }
}
