import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { AddressDTO, UpdateUserRequest, UserDTO } from '@/models'
import { toUpdateUserRequest, toUserEditFormValues } from '../lib/userEditPayload'
import { userEditSchema, type UserEditFormValues } from '../schemas/userEdit'
import { UserEditAccessFields } from './UserEditAccessFields'
import { UserEditAddressFields } from './UserEditAddressFields'
import { UserEditContactFields } from './UserEditContactFields'
import { UserEditIdentityFields } from './UserEditIdentityFields'
import { UserSystemInfo } from './UserSystemInfo'

type UserEditFormProps = {
  user: UserDTO
  isPending: boolean
  /** Envoi du PUT ; `onError` affiche le message dans le bandeau du formulaire. */
  onSubmit: (data: UpdateUserRequest, onError: (message: string) => void) => void
  onCancel: () => void
}

/** Formulaire du dialog d'édition, monté à chaque ouverture (valeurs et erreur repartent à zéro). */
export function UserEditForm({ user, isPending, onSubmit, onCancel }: UserEditFormProps) {
  const [error, setError] = useState('')
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: toUserEditFormValues(user),
  })

  // Remplit ville / code postal / pays à partir de l'adresse choisie (seulement les champs fournis)
  const handleAddressSelect = (address: AddressDTO) => {
    if (address.street) form.setValue('street', address.street)
    if (address.city) form.setValue('city', address.city)
    if (address.postalCode) form.setValue('postalCode', address.postalCode)
    if (address.country) form.setValue('country', address.country)
  }

  const submit = (values: UserEditFormValues) => {
    setError('')
    onSubmit(toUpdateUserRequest(values, user), setError)
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <UserEditIdentityFields
        control={form.control}
        email={user.email ?? ''}
        disabled={isPending}
      />
      <UserEditAccessFields control={form.control} disabled={isPending} />
      <UserEditContactFields control={form.control} disabled={isPending} />
      <UserEditAddressFields
        control={form.control}
        disabled={isPending}
        onAddressSelect={handleAddressSelect}
      />
      <UserSystemInfo user={user} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
