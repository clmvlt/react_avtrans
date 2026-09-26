import { Mail } from 'lucide-react'
import { ApiError } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserDTO } from '@/models'
import { useResendVerificationMutation } from '../api/useResendVerificationMutation'
import { errorMessage, notifyError, notifySuccess } from '../lib/messages'
import { UserEmailForm } from './UserEmailForm'

type UserEmailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDTO | null
}

/**
 * Message d'échec de UserEmailModal.vue. Bug B-24 reproduit : toute erreur 400 est présentée
 * comme un e-mail déjà utilisé.
 */
function toEmailErrorMessage(error: unknown): string {
  const status = error instanceof ApiError ? error.status : undefined
  if (status === 400) return 'Cet email est déjà utilisé par un autre utilisateur'
  if (status === 404) return 'Utilisateur non trouvé'
  return errorMessage(error, "Erreur lors de la modification de l'email")
}

/** Change l'e-mail d'un compte ou renvoie l'e-mail de vérification (UserEmailModal.vue). */
export function UserEmailDialog({ open, onOpenChange, user }: UserEmailDialogProps) {
  const mutation = useResendVerificationMutation()

  const handleOpenChange = (next: boolean) => {
    if (!next && mutation.isPending) return
    onOpenChange(next)
  }

  const handleSubmit = (
    email: string,
    isSameEmail: boolean,
    onError: (message: string) => void,
  ) => {
    if (!user?.uuid) return
    mutation.mutate(
      { uuid: user.uuid, email },
      {
        onSuccess: () => {
          notifySuccess(
            isSameEmail
              ? 'Email de vérification renvoyé avec succès !'
              : 'Email modifié avec succès ! Un email de vérification a été envoyé.',
            'Succès',
          )
          onOpenChange(false)
        },
        onError: (error) => {
          const message = toEmailErrorMessage(error)
          onError(message)
          notifyError(message, 'Erreur')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            Modifier l'email
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modifier l'adresse email de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        {user && (
          <UserEmailForm
            key={user.uuid}
            userName={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
            currentEmail={user.email ?? ''}
            isPending={mutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
