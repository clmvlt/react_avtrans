import { useState } from 'react'
import { useValidateAbsenceMutation } from '@/features/absences/api/useValidateAbsenceMutation'
import type { AbsenceDTO } from '@/models'

/**
 * Dialog « Détails de l'absence » du planning et validation (approbation / refus).
 *
 * Bug B-28 reproduit (MIGRATION.md 8.2, non autorisé à la correction) :
 * - fermer le dialog (croix, clic sur l'overlay, Échap) ne remet pas à zéro le formulaire de
 *   refus : l'absence suivante peut s'ouvrir avec « Motif du refus » déjà affiché et rempli
 *   (seule une validation réussie remet l'état à zéro, comme `closeModal` du Vue) ;
 * - les erreurs d'approbation et de refus sont avalées, sans aucun retour à l'utilisateur.
 */
export function useAbsenceDetailDialog() {
  const validateAbsence = useValidateAbsenceMutation()
  const [open, setOpen] = useState(false)
  const [absence, setAbsence] = useState<AbsenceDTO | null>(null)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  /** closeModal du Vue, appelé après une validation réussie. */
  const closeAndReset = () => {
    setOpen(false)
    setShowRejectInput(false)
    setRejectionReason('')
  }

  const openAbsence = (selected: AbsenceDTO) => {
    setAbsence(selected)
    setOpen(true)
  }

  const approve = () => {
    if (!absence?.uuid) return
    validateAbsence.mutate({ uuid: absence.uuid, approved: true }, { onSuccess: closeAndReset })
  }

  const confirmReject = () => {
    if (!absence?.uuid) return
    validateAbsence.mutate(
      { uuid: absence.uuid, approved: false, rejectionReason: rejectionReason || undefined },
      { onSuccess: closeAndReset },
    )
  }

  const cancelReject = () => {
    setShowRejectInput(false)
    setRejectionReason('')
  }

  return {
    open,
    /** Fermeture sans remise à zéro (B-28). */
    onOpenChange: setOpen,
    absence,
    openAbsence,
    showRejectInput,
    startReject: () => setShowRejectInput(true),
    rejectionReason,
    setRejectionReason,
    isValidating: validateAbsence.isPending,
    approve,
    confirmReject,
    cancelReject,
  }
}

export type AbsenceDetailDialogController = ReturnType<typeof useAbsenceDetailDialog>
