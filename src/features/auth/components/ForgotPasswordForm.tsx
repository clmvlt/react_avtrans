import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Mail } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { useRequestPasswordResetMutation } from '../api/useRequestPasswordResetMutation'
import { getErrorMessage } from '../lib/authErrors'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/forgotPassword'
import { AuthAlert } from './AuthAlert'

/** Demande d'un lien de réinitialisation (ForgotPassword.vue). */
export function ForgotPasswordForm() {
  const requestReset = useRequestPasswordResetMutation()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = ({ email }: ForgotPasswordFormValues) => {
    requestReset.mutate(email, {
      onSuccess: (response) => {
        if (response.success) form.reset()
      },
    })
  }

  // Réponse `success: false` sans exception : aucun retour visible, comme le Vue
  const sent = requestReset.data?.success === true

  return (
    <>
      {sent && (
        <AuthAlert variant="success" title="Email envoyé avec succès">
          <p className="text-sm leading-relaxed">
            Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte
            de réception.
          </p>
        </AuthAlert>
      )}

      {requestReset.isError && (
        <AuthAlert>
          {getErrorMessage(requestReset.error, "Une erreur s'est produite. Veuillez réessayer.")}
        </AuthAlert>
      )}

      {!sent && (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-6 flex flex-col gap-5"
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Adresse email"
                type="email"
                placeholder="votre@email.com"
                icon={Mail}
                disabled={requestReset.isPending}
                required
                autoComplete="email"
                error={fieldState.error?.message}
              />
            )}
          />

          <Button type="submit" disabled={requestReset.isPending} className="w-full">
            {requestReset.isPending && <LoaderCircle className="size-4 animate-spin" />}
            Envoyer le lien
          </Button>
        </form>
      )}
    </>
  )
}
