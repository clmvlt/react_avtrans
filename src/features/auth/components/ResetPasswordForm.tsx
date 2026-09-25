import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, LoaderCircle, Lock, Shield, TriangleAlert } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { useConfirmPasswordResetMutation } from '../api/useConfirmPasswordResetMutation'
import { useRedirectAfter } from '../hooks/useRedirectAfter'
import { getErrorMessage } from '../lib/authErrors'
import { PASSWORD_MIN_MESSAGE } from '../schemas/fields'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/resetPassword'
import { AuthAlert } from './AuthAlert'

type ResetPasswordFormProps = {
  /** Token du lien reçu par e-mail (`?token=`), vide s'il manque */
  token: string
}

/** Choix du nouveau mot de passe (ResetPassword.vue). */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const confirmReset = useConfirmPasswordResetMutation()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = ({ password }: ResetPasswordFormValues) => {
    confirmReset.mutate({ token, newPassword: password })
  }

  // Réponse `success: false` sans exception : aucun retour visible, comme le Vue
  const done = confirmReset.data?.success === true

  // Redirection vers la connexion 3 s après la réinitialisation
  useRedirectAfter('/login', 3000, done)

  // Token absent : le Vue affiche deux messages (celui-ci et le bandeau statique plus bas)
  const errorMessage = !token
    ? 'Token de réinitialisation manquant'
    : confirmReset.isError
      ? getErrorMessage(confirmReset.error, 'Le token est invalide, expiré ou a déjà été utilisé')
      : ''

  return (
    <>
      {done && (
        <AuthAlert variant="success" title="Mot de passe réinitialisé">
          <p className="mb-2 text-sm leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès !
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="size-3.5" />
            Redirection vers la page de connexion...
          </p>
        </AuthAlert>
      )}

      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      {!token && (
        <AuthAlert icon={TriangleAlert}>Token de réinitialisation manquant ou invalide.</AuthAlert>
      )}

      {!done && token && (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-6 flex flex-col gap-5"
        >
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Nouveau mot de passe"
                type="password"
                placeholder="Minimum 6 caractères"
                icon={Lock}
                disabled={confirmReset.isPending}
                required
                hint={PASSWORD_MIN_MESSAGE}
                autoComplete="new-password"
                showPasswordToggle
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Confirmer le mot de passe"
                icon={Shield}
                disabled={confirmReset.isPending}
                required
                autoComplete="new-password"
                showPasswordToggle
                error={fieldState.error?.message}
              />
            )}
          />

          <Button type="submit" disabled={confirmReset.isPending} className="w-full">
            {confirmReset.isPending && <LoaderCircle className="size-4 animate-spin" />}
            Réinitialiser le mot de passe
          </Button>
        </form>
      )}
    </>
  )
}
