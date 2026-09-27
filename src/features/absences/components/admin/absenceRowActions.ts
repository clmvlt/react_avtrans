import { Check, Eye, Pencil, Trash2, X, type LucideIcon } from 'lucide-react'
import type { AbsenceDTO } from '@/models'

/** Actions possibles sur une ligne de la liste admin. */
export type AbsenceAction = 'approve' | 'reject' | 'details' | 'edit' | 'delete'

export type AbsenceActionHandler = (action: AbsenceAction, absence: AbsenceDTO) => void

/** Entrée des menus d'une ligne (déroulant mobile et menu contextuel desktop). */
export type AbsenceMenuEntry =
  | { kind: 'separator'; key: string }
  | {
      kind: 'item'
      action: AbsenceAction
      label: string
      icon: LucideIcon
      tone?: 'success' | 'destructive'
    }

/** Une absence reste modifiable tant qu'elle n'est pas approuvée (`canEdit` du Vue). */
export const canEditAbsence = (absence: AbsenceDTO) => absence.status !== 'APPROVED'

/**
 * Entrées des menus d'une absence, dans l'ordre du Vue (menu déroulant mobile et menu contextuel
 * identiques) : Approuver / Refuser si en attente, Détails, Modifier si non approuvée, Supprimer.
 */
export function getAbsenceMenuEntries(absence: AbsenceDTO): AbsenceMenuEntry[] {
  const entries: AbsenceMenuEntry[] = []
  if (absence.status === 'PENDING') {
    entries.push(
      { kind: 'item', action: 'approve', label: 'Approuver', icon: Check, tone: 'success' },
      { kind: 'item', action: 'reject', label: 'Refuser', icon: X, tone: 'destructive' },
      { kind: 'separator', key: 'separator-validation' },
    )
  }
  entries.push({ kind: 'item', action: 'details', label: 'Détails', icon: Eye })
  if (canEditAbsence(absence)) {
    entries.push({ kind: 'item', action: 'edit', label: 'Modifier', icon: Pencil })
  }
  entries.push(
    { kind: 'separator', key: 'separator-delete' },
    { kind: 'item', action: 'delete', label: 'Supprimer', icon: Trash2, tone: 'destructive' },
  )
  return entries
}
