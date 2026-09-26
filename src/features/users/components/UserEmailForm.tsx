import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, CircleAlert, Info, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { USER_EMAIL_REGEX, userEmailSchema, type UserEmailFormValues } from '../schemas/userEmail'

type UserEmailFormProps = {
  userName: string
  currentEmail: string
  isPending: boolean
  /** Envoi ; `onError` affiche le message dans le bandeau du formulaire. */
  onSubmit: (email: string, isSameEmail: boolean, onError: (message: string) => void) => void
  onCancel: () => void
}

/** Formulaire du dialog « Modifier l'email », prérempli avec l'e-mail actuel à chaque ouverture. */
export function UserEmailForm({
  userName,
  currentEmail,
  isPending,
  onSubmit,
  onCancel,
}: UserEmailFormProps) {
  const [error, setError] = useState('')
  const form = useForm<UserEmailFormValues>({
    resolver: zodResolver(userEmailSchema),
    defaultValues: { email: currentEmail },
    mode: 'onChange',
  })
  const email = useWatch({ control: form.control, name: 'email' })

  const isSameEmail = email.trim().toLowerCase() === currentEmail.toLowerCase()
  // Même règle que le bouton du Vue (désactivé tant que l'e-mail est invalide)
  const isValid = email.trim() !== '' && USER_EMAIL_REGEX.test(email)

  const submit = (values: UserEmailFormValues) => {
    setError('')
    onSubmit(values.email.trim(), isSameEmail, setError)
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-md border border-border bg-muted p-3">
        <span className="text-base font-semibold text-foreground">{userName}</span>
        <span className="text-sm text-muted-foreground">Email actuel : {currentEmail}</span>
      </div>

      <div className="flex gap-3 rounded-md border border-info bg-info/10 p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-info" />
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-info">Important</p>
          {isSameEmail ? (
            <p className="text-sm text-muted-foreground">
              Cette action va renvoyer un email de vérification à l'adresse actuelle.
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-muted-foreground">La modification de l'email va :</p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                <li>Remplacer l'adresse email actuelle</li>
                <li>
                  Marquer l'email comme <strong>non vérifié</strong>
                </li>
                <li>Envoyer un nouvel email de vérification</li>
              </ul>
            </>
          )}
        </div>
      </div>

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <InputField
            {...field}
            label="Nouvel email"
            type="email"
            placeholder="nouveau@example.com"
            required
            disabled={isPending}
            icon={AtSign}
            error={fieldState.error?.message}
          />
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || !isValid}>
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          {isSameEmail ? 'Renvoyer la vérification' : "Modifier l'email"}
        </Button>
      </DialogFooter>
    </form>
  )
}
