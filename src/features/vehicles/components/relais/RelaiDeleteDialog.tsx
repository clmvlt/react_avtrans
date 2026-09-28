import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { VehiculeRelaiDTO } from '@/models'
import { useDeleteRelaiMutation } from '../../api/useDeleteRelaiMutation'
import { getErrorMessage } from '../../lib/errors'
import { formatRelaiPeriode } from '../../lib/relais'
import { FormErrorBanner } from '../FormErrorBanner'

type RelaiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  relai: VehiculeRelaiDTO | null
}

/** Suppression d'un relais saisi par erreur (D9) : ses relevés reviennent au véhicule. */
export function RelaiDeleteDialog({ open, onOpenChange, relai }: RelaiDeleteDialogProps) {
  const deleteRelai = useDeleteRelaiMutation()

  const handleOpenChange = (next: boolean) => {
    // L'erreur d'une tentative précédente ne réapparaît pas à la réouverture
    if (!next) deleteRelai.reset()
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!relai) return
    deleteRelai.mutate(relai.id, {
      onSuccess: () => {
        toast.success('Relais supprimé')
        handleOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Supprimer le relais"
      description="Confirmation de suppression du relais"
      hideDescription
      confirmLabel="Supprimer"
      pendingLabel="Suppression..."
      isPending={deleteRelai.isPending}
      onConfirm={handleConfirm}
    >
      {deleteRelai.isError && (
        <FormErrorBanner>
          {getErrorMessage(deleteRelai.error, 'Erreur lors de la suppression')}
        </FormErrorBanner>
      )}
      {relai && (
        <p className="text-sm text-muted-foreground">
          Supprimer le relais{' '}
          <span className="font-semibold tracking-wide text-foreground uppercase">
            {relai.immat}
          </span>{' '}
          ({formatRelaiPeriode(relai)}) ?
          {relai.nbReleves > 0 &&
            ` Ses ${relai.nbReleves} relevé${relai.nbReleves > 1 ? 's' : ''} kilométrique${relai.nbReleves > 1 ? 's' : ''} redeviendront ceux du véhicule.`}{' '}
          Pour un véhicule revenu, préférez « Terminer le relais ».
        </p>
      )}
    </ConfirmDialog>
  )
}
