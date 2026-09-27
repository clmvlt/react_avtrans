import { Check, Eye, Trash2, Wallet, X, type LucideIcon } from 'lucide-react'
import type { AcompteDTO } from '@/models'

/** Actions possibles sur une ligne de la liste admin. */
export type AcompteAction = 'approve' | 'reject' | 'togglePayment' | 'details' | 'delete'

export type AcompteActionHandler = (action: AcompteAction, acompte: AcompteDTO) => void

/** Entrée des menus d'une ligne (déroulant mobile et menu contextuel desktop). */
export type AcompteMenuEntry =
  | { kind: 'separator'; key: string }
  | {
      kind: 'item'
      action: AcompteAction
      label: string
      icon: LucideIcon
      tone?: 'success' | 'destructive'
    }

/**
 * Entrées des menus d'un acompte, dans l'ordre du Vue : Approuver / Refuser si en attente,
 * bascule de paiement si approuvé, Détails, Supprimer. Seul le libellé de la bascule diffère
 * entre le menu mobile (« Non payé ») et le menu contextuel (« Marquer non payé »).
 */
export function getAcompteMenuEntries(
  acompte: AcompteDTO,
  menu: 'dropdown' | 'context',
): AcompteMenuEntry[] {
  const entries: AcompteMenuEntry[] = []
  if (acompte.status === 'PENDING') {
    entries.push(
      { kind: 'item', action: 'approve', label: 'Approuver', icon: Check, tone: 'success' },
      { kind: 'item', action: 'reject', label: 'Refuser', icon: X, tone: 'destructive' },
      { kind: 'separator', key: 'separator-validation' },
    )
  }
  if (acompte.status === 'APPROVED') {
    const unpaidLabel = menu === 'dropdown' ? 'Non payé' : 'Marquer non payé'
    entries.push({
      kind: 'item',
      action: 'togglePayment',
      label: acompte.isPaid ? unpaidLabel : 'Marquer payé',
      icon: Wallet,
    })
  }
  entries.push(
    { kind: 'item', action: 'details', label: 'Détails', icon: Eye },
    { kind: 'separator', key: 'separator-delete' },
    { kind: 'item', action: 'delete', label: 'Supprimer', icon: Trash2, tone: 'destructive' },
  )
  return entries
}
