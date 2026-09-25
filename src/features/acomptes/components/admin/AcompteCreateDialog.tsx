import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApproveDirectlyField } from '@/features/absences/components/ApproveDirectlyField'
import { EmployeeComboboxField } from '@/features/absences/components/EmployeeComboboxField'
import { FormErrorAlert } from '@/features/absences/components/FormErrorAlert'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { useCreateAcompteForUserMutation } from '../../api/useCreateAcompteForUserMutation'
import { adminAcompteCreateSchema, type AdminAcompteCreateValues } from '../../schemas/acompte'

type AcompteCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Après la création (la page recharge la première page). */
  onSaved: () => void
}

/** Création d'un acompte pour un employé (port d'`AcompteEditModal.vue`, création seulement). */
export function AcompteCreateDialog({ open, onOpenChange, onSaved }: AcompteCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel acompte</DialogTitle>
          <DialogDescription>Créer un nouvel acompte pour un employé</DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : formulaire et erreurs repartent de zéro. */}
        <AcompteCreateBody onClose={() => onOpenChange(false)} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}

type AcompteCreateBodyProps = {
  onClose: () => void
  onSaved: () => void
}

function AcompteCreateBody({ onClose, onSaved }: AcompteCreateBodyProps) {
  const id = useId()
  const usersQuery = useUsersQuery()
  const createAcompte = useCreateAcompteForUserMutation()
  const saving = createAcompte.isPending

  const form = useForm<AdminAcompteCreateValues>({
    resolver: zodResolver(adminAcompteCreateSchema),
    // Montant initial « 0 », affiché tel quel comme le Vue
    defaultValues: { userUuid: '', montant: '0', raison: '', approved: false },
  })

  if (usersQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const error = createAcompte.isError
    ? errorMessage(createAcompte.error, 'Erreur lors de la création')
    : usersQuery.isError
      ? errorMessage(usersQuery.error, 'Erreur lors du chargement')
      : ''

  const onSubmit = (values: AdminAcompteCreateValues) =>
    createAcompte.mutate(
      {
        userUuid: values.userUuid,
        montant: Number(values.montant),
        raison: values.raison || undefined,
        approved: values.approved,
      },
      {
        onSuccess: () => {
          onSaved()
          toast.success('Succès', { description: 'Acompte créé avec succès' })
          onClose()
        },
        onError: (err) =>
          toast.error('Erreur', { description: errorMessage(err, 'Erreur lors de la création') }),
      },
    )

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <FormErrorAlert message={error} />}

      <Controller
        name="userUuid"
        control={form.control}
        render={({ field: { onChange, ...field }, fieldState }) => (
          <EmployeeComboboxField
            {...field}
            disabled={saving}
            error={fieldState.error?.message}
            onValueChange={onChange}
          />
        )}
      />

      <Controller
        name="montant"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${id}-montant`}>Montant (€) *</FieldLabel>
            <Input
              {...field}
              id={`${id}-montant`}
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 500"
              disabled={saving}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="raison"
        control={form.control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${id}-raison`}>Raison</FieldLabel>
            <Textarea
              {...field}
              id={`${id}-raison`}
              placeholder="Motif de la demande d'acompte..."
              disabled={saving}
              className="min-h-20"
            />
          </Field>
        )}
      />

      <Controller
        name="approved"
        control={form.control}
        render={({ field }) => (
          <ApproveDirectlyField
            checked={field.value}
            onCheckedChange={field.onChange}
            description="L'acompte sera validé sans attente"
            disabled={saving}
          />
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Créer l&apos;acompte
        </Button>
      </DialogFooter>
    </form>
  )
}
