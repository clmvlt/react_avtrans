import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Lock, Mail, Shield, User } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { useRegisterMutation } from '../api/useRegisterMutation'
import { getErrorMessage } from '../lib/authErrors'
import { PASSWORD_MIN_MESSAGE } from '../schemas/fields'
import { registerSchema, type RegisterFormValues } from '../schemas/register'

type RegisterFormProps = {
  /** Début d'une tentative : la page efface son message d'erreur */
  onSubmitStart: () => void
  /** Message d'erreur à afficher en haut de la carte */
  onError: (message: string) => void
  /** Compte créé : la page affiche les étapes suivantes pour cette adresse */
  onRegistered: (email: string) => void
}

/**
 * Formulaire d'inscription (Register.vue). Validation en direct comme le Vue : longueur du mot de
 * passe dès la saisie, et correspondance revérifiée quand le mot de passe change si la
 * confirmation est déjà remplie.
 */
export function RegisterForm({ onSubmitStart, onError, onRegistered }: RegisterFormProps) {
  const registerMutation = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = (values: RegisterFormValues) => {
    onSubmitStart()
    registerMutation.mutate(
      {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      },
      {
        onSuccess: (response) => {
          // Réponse `success: false` sans exception : aucun retour visible, comme le Vue.
          // Pas de redirection automatique : l'utilisateur doit d'abord vérifier son e-mail.
          if (response.success) onRegistered(values.email)
        },
        onError: (error) => {
          onError(getErrorMessage(error, "Une erreur s'est produite lors de l'inscription"))
        },
      },
    )
  }

  return (
    <form
      name="register"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="mb-6 flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Prénom"
              type="text"
              placeholder="Jean"
              icon={User}
              disabled={registerMutation.isPending}
              required
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
              type="text"
              placeholder="Dupont"
              icon={User}
              disabled={registerMutation.isPending}
              required
              autoComplete="family-name"
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

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
            disabled={registerMutation.isPending}
            required
            autoComplete="username email"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <InputField
            {...field}
            onChange={(event) => {
              field.onChange(event)
              // Comme le `computed` du Vue : l'écart n'est signalé que si la confirmation est saisie
              if (form.getValues('confirmPassword')) void form.trigger('confirmPassword')
            }}
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            disabled={registerMutation.isPending}
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
            placeholder="••••••••"
            icon={Shield}
            disabled={registerMutation.isPending}
            required
            autoComplete="new-password"
            showPasswordToggle
            error={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" disabled={registerMutation.isPending} className="w-full">
        {registerMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
        S'inscrire
      </Button>
    </form>
  )
}
