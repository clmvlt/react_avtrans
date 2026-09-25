import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ValidateRequestDialog } from '@/components/shared/ValidateRequestDialog'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import type { useDialogState } from '@/hooks/useDialogState'
import type { AcompteDTO } from '@/models'
import { useDeleteAcompteMutation } from '../../api/useDeleteAcompteMutation'
import { useValidateAcompteMutation } from '../../api/useValidateAcompteMutation'
import { AcompteCreateDialog } from './AcompteCreateDialog'
import { AcompteDeleteSummary } from './AcompteDeleteSummary'
import { AcompteDetailDialog } from './AcompteDetailDialog'
import { AcompteValidateSummary } from './AcompteValidateSummary'

export type AcompteDialogType = 'create' | 'detail' | 'approve' | 'reject' | 'delete'

type AcompteDialogsProps = {
  dialogs: ReturnType<typeof useDialogState<AcompteDialogType, AcompteDTO>>
  /** Après une création (le Vue rechargeait alors la première page). */
  onCreated: () => void
  /** Après une validation ou une suppression (rechargement de la page courante). */
  onChanged: () => void
}

/**
 * Dialogs de la page admin des acomptes : création, détail, approbation / refus, suppression.
 * Depuis le détail, « Approuver » et « Refuser » passent directement au dialog de validation.
 */
export function AcompteDialogs({ dialogs, onCreated, onChanged }: AcompteDialogsProps) {
  const { item, type } = dialogs
  const validate = useValidateAcompteMutation()
  const deleteAcompte = useDeleteAcompteMutation()
  const approving = type === 'approve'

  const handleValidate = (rejectionReason: string | undefined) => {
    if (!item?.uuid) return
    return validate.mutateAsync(
      { uuid: item.uuid, approved: approving, rejectionReason },
      {
        onSuccess: () => {
          onChanged()
          toast.success('Succès', {
            description: approving ? 'Acompte approuvé avec succès' : 'Acompte refusé',
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
    deleteAcompte.mutate(item.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Acompte supprimé avec succès' })
        dialogs.close()
        onChanged()
      },
      onError: (err) =>
        toast.error('Erreur', { description: errorMessage(err, 'Erreur lors de la suppression') }),
    })
  }

  return (
    <>
      <AcompteCreateDialog
        open={dialogs.isOpen('create')}
        onOpenChange={dialogs.onOpenChange}
        onSaved={onCreated}
      />

      <AcompteDetailDialog
        open={dialogs.isOpen('detail')}
        onOpenChange={dialogs.onOpenChange}
        acompte={item}
        onApprove={(acompte) => dialogs.open('approve', acompte)}
        onReject={(acompte) => dialogs.open('reject', acompte)}
      />

      <ValidateRequestDialog
        open={dialogs.isOpen('approve') || dialogs.isOpen('reject')}
        onOpenChange={dialogs.onOpenChange}
        approve={approving}
        title={approving ? "Approuver l'acompte" : "Refuser l'acompte"}
        description={
          approving ? "Confirmer l'approbation de cet acompte" : 'Indiquer le motif du refus'
        }
        isPending={validate.isPending}
        onConfirm={handleValidate}
      >
        <AcompteValidateSummary acompte={item} />
      </ValidateRequestDialog>

      <ConfirmDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        title="Supprimer l'acompte"
        description="Confirmer la suppression"
        hideDescription
        isPending={deleteAcompte.isPending}
        onConfirm={handleDelete}
        className="sm:max-w-lg"
      >
        <AcompteDeleteSummary acompte={item} />
      </ConfirmDialog>
    </>
  )
}
