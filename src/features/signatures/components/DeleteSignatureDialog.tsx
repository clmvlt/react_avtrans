import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useDeleteSignatureMutation } from '../api/useDeleteSignatureMutation'
import { formatSignatureDateTime } from '../lib/signatureFormatters'
import type { SignatureUserEntry } from '../lib/signatureResponses'

type DeleteSignatureDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Utilisateur dont on supprime la dernière signature. */
  entry: SignatureUserEntry | null
}

/**
 * Confirmation de suppression de la dernière signature d'un utilisateur. Comme le Vue, l'erreur
 * de suppression s'affiche dans le dialog (qui reste ouvert) ; le succès ferme et notifie.
 */
export function DeleteSignatureDialog({ open, onOpenChange, entry }: DeleteSignatureDialogProps) {
  const deleteSignature = useDeleteSignatureMutation()
  const signature = entry?.lastSignature
  const errorMessage = deleteSignature.isError
    ? deleteSignature.error.message || 'Erreur lors de la suppression'
    : ''

  const handleOpenChange = (next: boolean) => {
    // Fermeture = on oublie l'erreur de la tentative précédente
    if (!next) deleteSignature.reset()
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!signature?.uuid) return
    deleteSignature.mutate(signature.uuid, {
      onSuccess: () => {
        toast.success('Succès', {
          description: 'Signature supprimée avec succès',
          duration: 5000,
        })
        onOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Supprimer la signature"
      description="Cette action est irréversible."
      icon={null}
      isPending={deleteSignature.isPending}
      onConfirm={handleConfirm}
    >
      <p className="m-0 text-center text-base text-foreground">
        Êtes-vous sûr de vouloir supprimer cette signature ?
      </p>

      <div className="rounded-md border bg-muted p-4">
        <div className="flex justify-between border-b py-2">
          <span className="text-sm text-muted-foreground">Utilisateur</span>
          <span className="font-medium text-foreground">
            {entry?.user.firstName} {entry?.user.lastName}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="font-medium text-foreground">
            {formatSignatureDateTime(signature?.date)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">Heures signées</span>
          <span className="font-medium text-foreground">{signature?.heuresSignees}h</span>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
        >
          {errorMessage}
        </div>
      )}
    </ConfirmDialog>
  )
}
