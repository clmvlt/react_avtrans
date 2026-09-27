import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ValidateRequestDialog } from '@/components/shared/ValidateRequestDialog'
import type { useDialogState } from '@/hooks/useDialogState'
import type { AbsenceDTO } from '@/models'
import { useDeleteAbsenceMutation } from '../../api/useDeleteAbsenceMutation'
import { useValidateAbsenceMutation } from '../../api/useValidateAbsenceMutation'
import { errorMessage } from '../../lib/errorMessage'
import { AbsenceDeleteSummary } from './AbsenceDeleteSummary'
import { AbsenceDetailDialog } from './AbsenceDetailDialog'
import { AbsenceFormDialog } from './AbsenceFormDialog'
import { AbsenceHeuresDialog } from './AbsenceHeuresDialog'
import { AbsenceValidateSummary } from './AbsenceValidateSummary'

export type AbsenceDialogType =
  'create' | 'edit' | 'detail' | 'hours' | 'approve' | 'reject' | 'delete'

type AbsenceDialogsProps = {
  dialogs: ReturnType<typeof useDialogState<AbsenceDialogType, AbsenceDTO>>
  /** Après une création, une modification, une validation ou une suppression. */
  onChanged: () => void
}

/**
 * Dialogs de la page admin des absences : formulaire (création / modification), détail, heures
 * (D8), approbation / refus, suppression. Un seul ouvert à la fois ; depuis le détail,
 * « Approuver », « Refuser », « Modifier » et « Modifier les heures » passent directement au dialog
 * concerné.
 */
export function AbsenceDialogs({ dialogs, onChanged }: AbsenceDialogsProps) {
  const { item, type } = dialogs
  const validate = useValidateAbsenceMutation()
  const deleteAbsence = useDeleteAbsenceMutation()
  const approving = type === 'approve'

  const handleValidate = (rejectionReason: string | undefined) => {
    if (!item?.uuid) return
    return validate.mutateAsync(
      { uuid: item.uuid, approved: approving, rejectionReason },
      {
        onSuccess: () => {
          onChanged()
          toast.success('Succès', {
            description: approving ? 'Absence approuvée avec succès' : 'Absence refusée',
          })
          dialogs.close()
        },
        onError: (err) =>
          toast.error('Erreur', { description: errorMessage(err, 'Erreur lors de la validation') }),
      },
    )
  }

  const handleDelete = () => {
    if (!item?.uuid) return
    deleteAbsence.mutate(item.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Absence supprimée avec succès' })
        dialogs.close()
        onChanged()
      },
      onError: (err) =>
        toast.error('Erreur', { description: errorMessage(err, 'Erreur lors de la suppression') }),
    })
  }

  return (
    <>
      <AbsenceFormDialog
        open={dialogs.isOpen('create') || dialogs.isOpen('edit')}
        onOpenChange={dialogs.onOpenChange}
        absence={type === 'edit' ? item : null}
        onSaved={onChanged}
      />

      <AbsenceDetailDialog
        open={dialogs.isOpen('detail')}
        onOpenChange={dialogs.onOpenChange}
        absence={item}
        onApprove={(absence) => dialogs.open('approve', absence)}
        onReject={(absence) => dialogs.open('reject', absence)}
        onEdit={(absence) => dialogs.open('edit', absence)}
        onEditHours={(absence) => dialogs.open('hours', absence)}
      />

      <AbsenceHeuresDialog
        open={dialogs.isOpen('hours')}
        onOpenChange={dialogs.onOpenChange}
        absence={item}
        onSaved={onChanged}
      />

      <ValidateRequestDialog
        open={dialogs.isOpen('approve') || dialogs.isOpen('reject')}
        onOpenChange={dialogs.onOpenChange}
        approve={approving}
        title={approving ? "Approuver l'absence" : "Refuser l'absence"}
        description={
          approving ? "Confirmer l'approbation de cette absence" : 'Indiquer le motif du refus'
        }
        isPending={validate.isPending}
        onConfirm={handleValidate}
      >
        <AbsenceValidateSummary absence={item} />
      </ValidateRequestDialog>

      <ConfirmDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        title="Supprimer l'absence"
        description="Confirmer la suppression"
        hideDescription
        isPending={deleteAbsence.isPending}
        onConfirm={handleDelete}
        className="sm:max-w-lg"
      >
        <AbsenceDeleteSummary absence={item} />
      </ConfirmDialog>
    </>
  )
}
