import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { useChangePasswordMutation } from '../api/useChangePasswordMutation'
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/changePassword'

type ChangePasswordFormProps = {
  /** Retour en lecture (après « Annuler » ou un changement réussi) */
  onDone: () => void
}

type PasswordFieldName = keyof ChangePasswordFormValues

const PASSWORD_FIELDS: {
  name: PasswordFieldName
  label: string
  placeholder: string
  autoComplete: string
  hint?: string
}[] = [
  {
    name: 'currentPassword',
    label: 'Mot de passe actuel',
    placeholder: 'Entrez votre mot de passe actuel',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'Nouveau mot de passe',
    placeholder: 'Entrez votre nouveau mot de passe',
    autoComplete: 'new-password',
    hint: 'Minimum 8 caractères',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmer le mot de passe',
    placeholder: 'Confirmez votre nouveau mot de passe',
    autoComplete: 'new-password',
  },
]

/** Changement de mot de passe : actuel, nouveau (8 caractères minimum) et confirmation. */
export function ChangePasswordForm({ onDone }: ChangePasswordFormProps) {
  const changePassword = useChangePasswordMutation()
  const saving = changePassword.isPending

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = ({ currentPassword, newPassword }: ChangePasswordFormValues) => {
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          onDone()
          toast.success('Succès', { description: 'Mot de passe modifié avec succès' })
        },
        onError: (err) => {
          toast.error('Erreur', {
            description:
              err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe',
          })
        },
      },
    )
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {PASSWORD_FIELDS.map((passwordField) => (
        <Controller
          key={passwordField.name}
          name={passwordField.name}
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              type="password"
              label={passwordField.label}
              placeholder={passwordField.placeholder}
              autoComplete={passwordField.autoComplete}
              hint={passwordField.hint}
              required
              disabled={saving}
              showPasswordToggle
              error={fieldState.error?.message}
            />
          )}
        />
      ))}

      <div className="mt-2 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        {/* type="button" : sans lui, « Annuler » changerait le mot de passe (MIGRATION.md 8.1) */}
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          Changer le mot de passe
        </Button>
      </div>
    </form>
  )
}
