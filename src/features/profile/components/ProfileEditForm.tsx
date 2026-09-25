import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import type { UserDTO } from '@/models'
import { useUpdateProfileMutation } from '../api/useUpdateProfileMutation'
import { profileSchema, type ProfileFormValues } from '../schemas/profile'
import { AvatarPicker, type AvatarPickerValue } from './AvatarPicker'
import { RoleBadge } from './RoleBadge'

type ProfileEditFormProps = {
  user: UserDTO | null
  /** Retour en lecture (après « Annuler » ou un enregistrement réussi) */
  onDone: () => void
}

/** Informations personnelles en édition : photo, prénom, nom (e-mail et rôle non modifiables). */
export function ProfileEditForm({ user, onDone }: ProfileEditFormProps) {
  const updateProfile = useUpdateProfileMutation()
  const saving = updateProfile.isPending
  const [avatar, setAvatar] = useState<AvatarPickerValue>({ picture: '', removePicture: false })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  })

  const onSubmit = ({ firstName, lastName }: ProfileFormValues) => {
    // Nouvelle photo : base64 ; suppression demandée : '' ; sinon undefined (inchangée)
    const picture = avatar.picture ? avatar.picture : avatar.removePicture ? '' : undefined

    updateProfile.mutate(
      { firstName, lastName, picture },
      {
        onSuccess: () => {
          onDone()
          toast.success('Succès', { description: 'Profil mis à jour avec succès' })
        },
        onError: (err) => {
          toast.error('Erreur', {
            description:
              err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil',
          })
        },
      },
    )
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <AvatarPicker
        pictureUrl={user?.pictureUrl}
        value={avatar}
        onChange={setAvatar}
        disabled={saving}
      />

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Prénom"
              required
              disabled={saving}
              placeholder="Votre prénom"
              autoComplete="given-name"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Nom"
              required
              disabled={saving}
              placeholder="Votre nom"
              autoComplete="family-name"
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Email</span>
        <div className="flex flex-col gap-1">
          <span className="rounded-md border bg-muted px-3 py-2 text-sm font-medium text-foreground">
            {user?.email}
          </span>
          <span className="text-xs text-muted-foreground">
            L'adresse email ne peut pas être modifiée
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Rôle</span>
        <div className="flex flex-col gap-1">
          <RoleBadge role={user?.role} />
          <span className="text-xs text-muted-foreground">Le rôle ne peut pas être modifié</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3 border-t pt-4 max-sm:flex-col">
        {/* type="button" : sans lui, « Annuler » enregistrerait le formulaire (MIGRATION.md 8.1) */}
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}
