import type { LucideIcon } from 'lucide-react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ServiceModificationAction, ServiceModificationDTO } from '@/models'
import {
  formatParisDate,
  formatParisLongDate,
  formatParisTime,
  isSameMinute,
  parisDayKey
} from '@/utils/timeFormatters'

interface ActionMeta {
  /** Libellé court (filtres, badges) */
  label: string
  /** Titre d'une entrée d'historique — mêmes libellés que les notifications */
  title: string
  icon: LucideIcon
  /** Classes de la pastille / du badge (variante sombre incluse) */
  classes: string
}

const ACTION_META: Record<ServiceModificationAction, ActionMeta> = {
  CREATE: {
    label: 'Ajout',
    title: 'Pointage ajouté',
    icon: Plus,
    classes: 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
  },
  UPDATE: {
    label: 'Modification',
    title: 'Pointage modifié',
    icon: Pencil,
    classes: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
  },
  DELETE: {
    label: 'Suppression',
    title: 'Pointage supprimé',
    icon: Trash2,
    classes: 'border-destructive/30 bg-destructive/10 text-destructive'
  }
}

/** Options du filtre « Type d'action » */
export const serviceModificationActionOptions = (Object.keys(ACTION_META) as ServiceModificationAction[])
  .map(action => ({ value: action, label: ACTION_META[action].label }))

/**
 * Métadonnées d'affichage d'une action (valeur inconnue → présentée comme une modification)
 */
export function getServiceModificationActionMeta(action?: string | null): ActionMeta {
  return ACTION_META[action as ServiceModificationAction] ?? ACTION_META.UPDATE
}

export type ServiceFieldKey = 'debut' | 'fin' | 'isBreak'

export interface ServiceFieldRow {
  key: ServiceFieldKey
  label: string
  /** Valeur avant l'action ('' pour un CREATE) */
  before: string
  /** Valeur après l'action ('' pour un DELETE) */
  after: string
  /** UPDATE uniquement : la valeur a changé (heures comparées à la minute) */
  changed: boolean
}

export interface ServiceModificationView {
  /** Jour de référence du pointage, date longue ("samedi 12 septembre 2026") */
  referenceDayLabel: string
  /** Jour de référence du pointage, date courte (dd/MM/yyyy) */
  referenceDate: string
  /** Lignes Début / Fin / Type */
  rows: ServiceFieldRow[]
  /** UPDATE : lignes réellement modifiées */
  changedRows: ServiceFieldRow[]
}

/**
 * Libellé du type de pointage
 */
export function formatServiceKind(isBreak: boolean | null | undefined): string {
  if (isBreak === true) return 'Pause'
  if (isBreak === false) return 'Service'
  return '—'
}

/**
 * HH:mm si l'instant tombe chacun des jours `dayKeys`, sinon la date complète "dd/MM/yyyy HH:mm"
 */
const formatInstant = (value: string, ...dayKeys: string[]): string => {
  const time = formatParisTime(value)
  const day = parisDayKey(value)
  return dayKeys.every(key => key === day) ? time : `${formatParisDate(value)} ${time}`
}

interface Snapshot {
  debut: string | null
  fin: string | null
  isBreak: boolean | null
}

const formatSnapshot = (snapshot: Snapshot, referenceDay: string) => ({
  // Début : date complète s'il n'est pas le jour de référence du pointage (déplacé à un autre jour)
  debut: snapshot.debut ? formatInstant(snapshot.debut, referenceDay) : '—',
  // Fin : null = en cours ; date complète si elle tombe un autre jour que le début (ou que le jour de référence)
  fin: snapshot.fin
    ? formatInstant(snapshot.fin, referenceDay, parisDayKey(snapshot.debut) || referenceDay)
    : 'En cours',
  isBreak: formatServiceKind(snapshot.isBreak)
})

/**
 * Prépare l'affichage d'une entrée du journal : valeurs avant / après formatées
 * en heure de Paris et champs modifiés (UPDATE).
 */
export function buildServiceModificationView(modification: ServiceModificationDTO): ServiceModificationView {
  // old* sont null pour un CREATE, new* pour un DELETE
  const hasBefore = modification.action !== 'CREATE'
  const hasAfter = modification.action !== 'DELETE'
  const isUpdate = hasBefore && hasAfter

  const referenceSource = hasBefore
    ? (modification.oldDebut ?? modification.newDebut)
    : modification.newDebut
  const referenceDay = parisDayKey(referenceSource)

  const before = hasBefore
    ? formatSnapshot({ debut: modification.oldDebut, fin: modification.oldFin, isBreak: modification.oldIsBreak }, referenceDay)
    : null
  const after = hasAfter
    ? formatSnapshot({ debut: modification.newDebut, fin: modification.newFin, isBreak: modification.newIsBreak }, referenceDay)
    : null

  const rows: ServiceFieldRow[] = [
    {
      key: 'debut',
      label: 'Début',
      before: before?.debut ?? '',
      after: after?.debut ?? '',
      changed: isUpdate && !isSameMinute(modification.oldDebut, modification.newDebut)
    },
    {
      key: 'fin',
      label: 'Fin',
      before: before?.fin ?? '',
      after: after?.fin ?? '',
      changed: isUpdate && !isSameMinute(modification.oldFin, modification.newFin)
    },
    {
      key: 'isBreak',
      label: 'Type',
      before: before?.isBreak ?? '',
      after: after?.isBreak ?? '',
      changed: isUpdate && (modification.oldIsBreak ?? null) !== (modification.newIsBreak ?? null)
    }
  ]

  return {
    referenceDayLabel: formatParisLongDate(referenceSource),
    referenceDate: formatParisDate(referenceSource),
    rows,
    changedRows: rows.filter(row => row.changed)
  }
}
