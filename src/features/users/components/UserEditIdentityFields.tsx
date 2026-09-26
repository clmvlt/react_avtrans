import { Mail, User } from 'lucide-react'
import { Controller, type Control } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import type { UserEditFormValues } from '../schemas/userEdit'

type UserEditIdentityFieldsProps = {
  control: Control<UserEditFormValues>
  /** E-mail actuel, en lecture seule (il se change par le dialog dédié) */
  email: string
  disabled: boolean
}

/** Prénom, nom et e-mail (non modifiable) du dialog d'édition d'un compte. */
export function UserEditIdentityFields({ control, email, disabled }: UserEditIdentityFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Prénom"
              placeholder="Jean"
              required
              disabled={disabled}
              icon={User}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Nom"
              placeholder="Dupont"
              required
              disabled={disabled}
              icon={User}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <InputField
        label="Email"
        type="email"
        value={email}
        readOnly
        disabled
        placeholder="jean.dupont@example.com"
        icon={Mail}
        hint="L'email ne peut pas être modifié"
      />
    </>
  )
}
