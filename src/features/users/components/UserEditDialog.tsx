import { UserPen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UpdateUserRequest, UserDTO } from '@/models'
import { useUpdateUserMutation } from '../api/useUpdateUserMutation'
import { errorMessage, notifyError, notifySuccess } from '../lib/messages'
import { UserEditForm } from './UserEditForm'

type UserEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDTO | null
}

/**
 * Modification d'un compte par un admin (UserEditModal.vue, mode édition seul : la création était
 * factice et n'est pas portée). Fermeture impossible pendant l'enregistrement.
 */
export function UserEditDialog({ open, onOpenChange, user }: UserEditDialogProps) {
  // B-25 reproduit : la réponse remplace l'utilisateur de la liste, sans fusion
  const mutation = useUpdateUserMutation({ cacheUpdate: 'replace' })

  const handleOpenChange = (next: boolean) => {
    if (!next && mutation.isPending) return
    onOpenChange(next)
  }

  const handleSubmit = (data: UpdateUserRequest, onError: (message: string) => void) => {
    if (!user?.uuid) return
    mutation.mutate(
      { uuid: user.uuid, data },
      {
        onSuccess: () => {
          notifySuccess('Utilisateur modifié avec succès !', 'Succès')
          onOpenChange(false)
        },
        onError: (error) => {
          const message = errorMessage(error, 'Erreur lors de la modification')
          onError(message)
          notifyError(message, 'Erreur')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPen className="size-5" />
            </div>
            Modifier l'utilisateur
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire de modification d'utilisateur
          </DialogDescription>
        </DialogHeader>

        {user && (
          <UserEditForm
            key={user.uuid}
            user={user}
            isPending={mutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
