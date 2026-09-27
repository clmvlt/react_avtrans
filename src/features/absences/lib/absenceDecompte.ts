import { parseLocalDateKey } from '@/lib/dates'
import type { AbsenceDTO, ModeDecompte, MotifJourDecompte } from '@/models'
import type { AbsenceDecompteRequest } from '@/services'
import { CUSTOM_ABSENCE_TYPE } from '../schemas/absence'

/**
 * Heures créditées par les absences (décision D8, MIGRATION.md). Le calcul est fait par l'API :
 * ces fonctions ne font que libeller et formater.
 */

export const DEFAULT_MODE_DECOMPTE: ModeDecompte = 'JOURS_OUVRABLES'

type ModeDecompteOption = {
  value: ModeDecompte
  label: string
  /** Libellé court après le nombre de jours (« 6 j ouvrables »). */
  unit: string
  description: string
}

export const MODE_DECOMPTE_OPTIONS: ModeDecompteOption[] = [
  {
    value: 'JOURS_OUVRABLES',
    label: 'Jours ouvrables (lun. → sam.)',
    unit: 'ouvrable',
    description:
      'Règle des congés payés : 6 jours par semaine, dimanches et fériés exclus. Une absence qui finit un vendredi compte aussi le samedi.',
  },
  {
    value: 'JOURS_OUVRES',
    label: 'Jours ouvrés (lun. → ven.)',
    unit: 'ouvré',
    description: '5 jours par semaine, samedis, dimanches et fériés exclus.',
  },
  {
    value: 'JOURS_CALENDAIRES',
    label: 'Jours calendaires (tous les jours)',
    unit: 'calendaire',
    description: '7 jours par semaine, week-ends et fériés compris.',
  },
]

export function getModeDecompteOption(mode: ModeDecompte | null | undefined): ModeDecompteOption {
  return (
    MODE_DECOMPTE_OPTIONS.find((option) => option.value === mode) ??
    (MODE_DECOMPTE_OPTIONS[0] as ModeDecompteOption)
  )
}

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

/** « 35 h », « 29,17 h ». */
export function formatHeures(value: number | null | undefined): string {
  return `${numberFormat.format(value ?? 0)} h`
}

/** « 6 j ouvrables », « 0,5 j ouvrable ». */
export function formatJoursDecomptes(
  jours: number | null | undefined,
  mode: ModeDecompte | null | undefined,
): string {
  const value = jours ?? 0
  const unit = getModeDecompteOption(mode).unit
  return `${numberFormat.format(value)} j ${unit}${value > 1 ? 's' : ''}`
}

/** Les heures de l'absence ont-elles été fixées à la main ? */
export function hasHeuresForcees(absence: Pick<AbsenceDTO, 'heuresForcees'>): boolean {
  return absence.heuresForcees !== null && absence.heuresForcees !== undefined
}

/** Explication d'une absence qui ne crédite rien (contrat absent ou type sans heures), ou null. */
export function getZeroHeuresReason(
  absence: Pick<AbsenceDTO, 'compteHeures' | 'contratRenseigne' | 'heuresForcees'>,
): string | null {
  if (hasHeuresForcees(absence)) return null
  if (absence.compteHeures === false) return "Ce type d'absence ne compte pas d'heures"
  if (absence.contratRenseigne === false) return 'Heures du contrat non renseignées'
  return null
}

export const MOTIF_JOUR_LABELS: Record<MotifJourDecompte, string> = {
  DIMANCHE: 'Dimanche, non décompté',
  SAMEDI: 'Samedi, non décompté',
  FERIE: 'Férié, non décompté',
  SAMEDI_REPRISE: 'Samedi avant la reprise, décompté',
}

/** Heures hebdomadaires d'un contrat mensuel (× 12 / 52), comme l'API. */
export function heuresHebdoFromMensuel(mensuel: number): number {
  return (mensuel * 12) / 52
}

/** « lun. 5 oct. » pour une clé `YYYY-MM-DD` (heure locale). */
export function formatJourDecompte(key: string): string {
  const date = parseLocalDateKey(key)
  if (!date) return key
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

type DecompteInput = {
  startDate: string
  endDate: string
  period: string
  /** UUID du type, `custom` (type personnalisé) ou vide (pas encore choisi). */
  absenceTypeUuid: string
  /** Employé (aperçu admin uniquement). */
  userUuid?: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Requête d'aperçu du décompte d'après les champs du formulaire, ou `null` tant qu'elle ne peut
 * pas être calculée (dates incomplètes ou inversées, type non choisi, employé manquant en admin).
 */
export function buildDecompteRequest(
  input: DecompteInput,
  scope: 'my' | 'admin',
): AbsenceDecompteRequest | null {
  const { startDate, endDate, period, absenceTypeUuid, userUuid } = input
  if (!ISO_DATE.test(startDate) || !ISO_DATE.test(endDate) || startDate > endDate) return null
  if (!absenceTypeUuid) return null
  if (scope === 'admin' && !userUuid) return null
  const isCustom = absenceTypeUuid === CUSTOM_ABSENCE_TYPE
  return {
    startDate,
    endDate,
    period,
    ...(isCustom ? {} : { absenceTypeUuid }),
    ...(scope === 'admin' ? { userUuid } : {}),
  }
}
