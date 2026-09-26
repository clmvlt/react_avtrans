import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { errorMessage } from '@/features/users/lib/messages'
import {
  useCreateAdminServiceMutation,
  useUpdateAdminServiceMutation,
} from '../api/useAdminServiceMutations'
import type { AdminServicePayload, ServiceFormTarget } from '../lib/serviceForm'
import { ServiceForm } from './ServiceForm'

type ServiceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ServiceFormTarget | null
  userUuid: string
  /** Après enregistrement : retour à la première page, comme le Vue */
  onSaved: () => void
}

/** Création ou modification d'un service ou d'une pause pour un employé. */
export function ServiceFormDialog({
  open,
  onOpenChange,
  target,
  userUuid,
  onSaved,
}: ServiceFormDialogProps) {
  const createMutation = useCreateAdminServiceMutation(userUuid)
  const updateMutation = useUpdateAdminServiceMutation(userUuid)
  const isEdit = !!target?.service
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: AdminServicePayload, onError: (message: string) => void) => {
    const callbacks = {
      onSuccess: () => {
        onSaved()
        onOpenChange(false)
      },
      onError: (error: Error) => onError(errorMessage(error, 'Une erreur est survenue')),
    }
    const serviceUuid = target?.service?.uuid
    if (isEdit && serviceUuid) updateMutation.mutate({ serviceUuid, payload }, callbacks)
    else createMutation.mutate(payload, callbacks)
  }

  const isBreak = target?.values.isBreak

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (isBreak ? 'Modifier la pause' : 'Modifier le service') : 'Nouveau service'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations puis enregistrez.'
              : 'Renseignez un service ou une pause, puis créez-le.'}
          </DialogDescription>
        </DialogHeader>

        {target && (
          <ServiceForm
            isEdit={isEdit}
            defaultValues={target.values}
            coordinates={target.coordinates}
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
