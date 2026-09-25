import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Mail, User } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { InputField } from '@/components/shared/InputField'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { GoogleProfile } from '@/models'
import { useGoogleRegisterMutation } from '../api/useGoogleRegisterMutation'
import { getGoogleErrorMessage } from '../lib/authErrors'
import { clearRegistration, getRegistration } from '../lib/googleRegistration'
import {
  googleRegisterSchema,
  type GoogleRegisterFormInput,
  type GoogleRegisterFormValues,
} from '../schemas/googleRegister'
import { AuthAlert } from './AuthAlert'

type GoogleRegisterFormProps = {
  /** Profil Google lu dans le relais au montage de la page */
  profile: GoogleProfile
  /** Compte créé, en attente d'activation : message à afficher */
  onCreated: (message: string) => void
  /** « Annuler » : relais vidé, retour au login */
  onCancel: () => void
}

/** Initiales de l'aperçu d'avatar, recalculées pendant la saisie (`?` si vides). */
const getInitials = (firstName: string, lastName: string) =>
  ((firstName.trim()[0] ?? '') + (lastName.trim()[0] ?? '')).toUpperCase() || '?'

/** Création d'un compte à partir du profil Google (GoogleRegister.vue). */
export function GoogleRegisterForm({ profile, onCreated, onCancel }: GoogleRegisterFormProps) {
  const navigate = useNavigate()
  const googleRegister = useGoogleRegisterMutation()
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<GoogleRegisterFormInput, unknown, GoogleRegisterFormValues>({
    resolver: zodResolver(googleRegisterSchema),
    defaultValues: { firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' },
  })
  const [firstName, lastName] = useWatch({
    control: form.control,
    name: ['firstName', 'lastName'],
  })

  const onSubmit = (values: GoogleRegisterFormValues) => {
    setErrorMessage('')

    const idToken = getRegistration()?.idToken
    if (!idToken) {
      // Sécurité : le token a expiré ou a été perdu
      navigate('/login', { replace: true })
      return
    }

    googleRegister.mutate(
      { idToken, firstName: values.firstName, lastName: values.lastName },
      {
        onSuccess: (response) => {
          if (response.success && response.status === 'PENDING_ACTIVATION') {
            // Compte créé, en attente d'activation admin (pas de connexion à ce stade)
            clearRegistration()
            onCreated(
              response.message ||
                'Votre compte a été créé via Google. Il doit être activé par un administrateur avant la première connexion.',
            )
          } else {
            setErrorMessage(response.message || 'La création du compte a échoué.')
          }
        },
        onError: (error) => {
          setErrorMessage(
            getGoogleErrorMessage(error, 'Une erreur est survenue lors de la création du compte.'),
          )
        },
      },
    )
  }

  return (
    <>
      <div className="mb-8 text-center">
        {/* Aperçu de l'avatar Google, initiales si la photo manque ou ne charge pas */}
        <Avatar className="mb-4 inline-flex size-20 border border-border bg-primary/10">
          {profile.pictureUrl && (
            <AvatarImage
              src={profile.pictureUrl}
              alt="Photo de profil Google"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <AvatarFallback className="bg-transparent text-2xl font-bold text-primary">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">Créer mon compte</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Vérifiez vos informations puis créez votre compte Google.
        </p>
      </div>

      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      <form
        name="google-register"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-6 flex flex-col gap-5"
      >
        <InputField
          value={profile.email ?? ''}
          readOnly
          label="Adresse email"
          type="email"
          icon={Mail}
          disabled
          hint="Vérifiée par Google — non modifiable"
          autoComplete="username email"
        />

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
                disabled={googleRegister.isPending}
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
                disabled={googleRegister.isPending}
                required
                autoComplete="family-name"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <Button type="submit" disabled={googleRegister.isPending} className="w-full">
          {googleRegister.isPending && <LoaderCircle className="size-4 animate-spin" />}
          Créer mon compte
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={googleRegister.isPending}
          className="w-full"
          onClick={onCancel}
        >
          Annuler
        </Button>
      </form>
    </>
  )
}
