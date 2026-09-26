import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { UserDTO } from '@/models'

type DeleteUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDTO | null
  isPending: boolean
  onConfirm: () => void
}

/** Suppression définitive d'un compte, à confirmer en tapant « CONFIRMER ». */
export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  isPending,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Suppression de l'utilisateur"
      description="Confirmer la suppression de l'utilisateur"
      hideDescription
      confirmText="CONFIRMER"
      confirmLabel="Supprimer définitivement"
      isPending={isPending}
      onConfirm={onConfirm}
    >
      <p className="text-center text-lg font-semibold text-foreground">
        {user?.firstName} {user?.lastName}
      </p>

      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-left">
        <p className="mb-2 font-semibold text-destructive">
          Attention : Cette action est irréversible !
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          La suppression de cet utilisateur entraînera également la suppression de :
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Tous ses pointages</li>
          <li>Tous ses historiques de services</li>
          <li>Toutes ses données personnelles</li>
        </ul>
      </div>
    </ConfirmDialog>
  )
}
