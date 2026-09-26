import { CreditCard, MapPin } from 'lucide-react'
import { Controller, type Control } from 'react-hook-form'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'
import { InputField } from '@/components/shared/InputField'
import type { AddressDTO } from '@/models'
import type { UserEditFormValues } from '../schemas/userEdit'

type UserEditAddressFieldsProps = {
  control: Control<UserEditFormValues>
  disabled: boolean
  /** Adresse choisie dans les suggestions : remplit ville, code postal et pays */
  onAddressSelect: (address: AddressDTO) => void
}

/** Section « Adresse & Permis » du dialog d'édition d'un compte. */
export function UserEditAddressFields({
  control,
  disabled,
  onAddressSelect,
}: UserEditAddressFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Adresse & Permis</h4>

      <Controller
        name="driverLicenseNumber"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            label="Numéro de permis"
            placeholder="Ex: 12AB34567"
            disabled={disabled}
            icon={CreditCard}
          />
        )}
      />

      <Controller
        name="street"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <AddressAutocomplete
            {...field}
            value={value}
            onValueChange={onChange}
            onSelect={onAddressSelect}
            label="Rue"
            placeholder="12 rue de la Paix"
            disabled={disabled}
            icon={MapPin}
            hint="Commencez à taper pour rechercher une adresse"
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <InputField {...field} label="Ville" placeholder="Paris" disabled={disabled} />
          )}
        />
        <Controller
          name="postalCode"
          control={control}
          render={({ field }) => (
            <InputField {...field} label="Code postal" placeholder="75000" disabled={disabled} />
          )}
        />
      </div>

      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <InputField {...field} label="Pays" placeholder="France" disabled={disabled} />
        )}
      />
    </div>
  )
}
