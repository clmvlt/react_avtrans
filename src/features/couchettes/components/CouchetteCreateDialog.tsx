import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { ErrorState } from '@/components/shared/ErrorState'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { selectableUsers } from '@/utils/userVisibility'
import { useCreateCouchetteForUserMutation } from '../api/useCreateCouchetteForUserMutation'
import { couchetteCreateSchema, type CouchetteCreateFormValues } from '../schemas/couchetteCreate'

type CouchetteCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Couchette créée (dialog déjà fermé) : la page recharge la page 1. */
  onCreated: () => void
}

/** « Nouvelle couchette » : création par un admin pour un employé (CouchetteCreateModal.vue). */
export function CouchetteCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: CouchetteCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle couchette</DialogTitle>
          <DialogDescription>Créer une nouvelle couchette pour un employé</DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : formulaire vide, comme le `resetForm` du Vue */}
        <CouchetteCreateForm
          onCancel={() => onOpenChange(false)}
          onCreated={() => {
            onOpenChange(false)
            onCreated()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

type CouchetteCreateFormProps = {
  onCancel: () => void
  onCreated: () => void
}

function CouchetteCreateForm({ onCancel, onCreated }: CouchetteCreateFormProps) {
  const usersQuery = useUsersQuery()
  const createCouchette = useCreateCouchetteForUserMutation()
  const saving = createCouchette.isPending

  const form = useForm<CouchetteCreateFormValues>({
    resolver: zodResolver(couchetteCreateSchema),
    defaultValues: { userUuid: '', date: '' },
  })

  // GET /users renvoie aussi les masqués : seuls les visibles sont proposés pour une création.
  const userOptions = selectableUsers(usersQuery.data ?? [])
    .filter((user) => user.uuid)
    .map((user) => ({ value: user.uuid ?? '', label: `${user.firstName} ${user.lastName}` }))

  const submitError = createCouchette.isError
    ? createCouchette.error.message || 'Erreur lors de la création'
    : ''

  const onSubmit = ({ userUuid, date }: CouchetteCreateFormValues) => {
    createCouchette.mutate(
      { userUuid, date: date || undefined },
      {
        onSuccess: () => {
          toast.success('Succès', { description: 'Couchette créée avec succès', duration: 5000 })
          onCreated()
        },
        // Le Vue affiche l'erreur deux fois (bloc + toast) : conservé
        onError: (error) => {
          toast.error('Erreur', {
            description: error.message || 'Erreur lors de la création',
            duration: 7000,
          })
        },
      },
    )
  }

  if (usersQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {usersQuery.isError && (
        <ErrorState
          message={usersQuery.error.message || 'Erreur lors du chargement'}
          onRetry={() => void usersQuery.refetch()}
          isRetrying={usersQuery.isRefetching}
        />
      )}

      {submitError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" />
          {submitError}
        </div>
      )}

      <Controller
        name="userUuid"
        control={form.control}
        render={({ field, fieldState }) => (
          <Combobox
            label="Employé"
            required
            options={userOptions}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            placeholder="Sélectionner un employé"
            searchPlaceholder="Rechercher un employé..."
            disabled={saving}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="date"
        control={form.control}
        render={({ field }) => (
          <InputField
            {...field}
            type="date"
            label="Date"
            hint="Laisser vide pour aujourd'hui"
            disabled={saving}
          />
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Créer la couchette
        </Button>
      </DialogFooter>
    </form>
  )
}
