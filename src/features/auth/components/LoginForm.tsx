import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Lock, Mail } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import type { LoginResponse } from '@/models'
import { useAuthStore } from '@/stores/auth-store'
import { useLoginMutation } from '../api/useLoginMutation'
import { loginSchema, type LoginFormValues } from '../schemas/login'

type LoginFormProps = {
  /** Début d'une tentative : la page efface son message d'erreur */
  onSubmitStart: () => void
  /** Message d'erreur à afficher en haut de la carte */
  onError: (message: string) => void
  /** Connexion réussie, session appliquée */
  onLoggedIn: () => void
}

/** Utilisateur que le store retiendrait (applySession exige un token et un utilisateur). */
const sessionUser = (response: LoginResponse) =>
  response.user?.token || response.token ? response.user : undefined

/** Formulaire e-mail / mot de passe de /login (Login.vue). */
export function LoginForm({ onSubmitStart, onError, onLoggedIn }: LoginFormProps) {
  const applySession = useAuthStore((s) => s.applySession)
  const logout = useAuthStore((s) => s.logout)
  const login = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {
    onSubmitStart()
    login.mutate(values, {
      onSuccess: (response) => {
        // Réponse `success: false` sans exception : aucun retour visible, comme le Vue
        if (!response.success) return

        const user = sessionUser(response)
        if (!user?.isMailVerified) {
          onError('Veuillez vérifier votre email avant de vous connecter')
          logout()
          return
        }
        if (!user.isActive) {
          onError('Votre compte est désactivé. Veuillez contacter un administrateur.')
          logout()
          return
        }

        applySession(response)
        onLoggedIn()
      },
      onError: (error) => {
        // Bug B-34 du Vue reproduit : « Network error » / « Request timeout » en anglais
        onError(error instanceof Error ? error.message : 'Identifiants invalides')
      },
    })
  }

  return (
    <form
      name="login"
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
            disabled={login.isPending}
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
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            disabled={login.isPending}
            required
            autoComplete="current-password"
            showPasswordToggle
            error={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending && <LoaderCircle className="size-4 animate-spin" />}
        Se connecter
      </Button>
    </form>
  )
}
