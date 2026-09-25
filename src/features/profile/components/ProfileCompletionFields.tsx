import { CreditCard, MapPin } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'
import { InputField } from '@/components/shared/InputField'
import type { AddressDTO } from '@/models'
import type { ProfileCompletionFormValues } from '../schemas/profileCompletion'

type ProfileCompletionFieldsProps = {
  form: UseFormReturn<ProfileCompletionFormValues>
  /** Champ du permis affiché (numéro manquant) */
  showDriverLicense: boolean
  /** Champs d'adresse affichés (rue, ville ou code postal manquant) */
  showAddress: boolean
  disabled: boolean
}

/** Champs du dialog de complétion : permis et / ou adresse, selon ce qui manque. */
export function ProfileCompletionFields({
  form,
  showDriverLicense,
  showAddress,
  disabled,
}: ProfileCompletionFieldsProps) {
  // Une suggestion choisie remplit ville, code postal et pays (valeurs vides ignorées)
  const handleAddressSelect = (address: AddressDTO) => {
    if (address.street) form.setValue('street', address.street)
    if (address.city) form.setValue('city', address.city)
    if (address.postalCode) form.setValue('postalCode', address.postalCode)
    if (address.country) form.setValue('country', address.country)
  }

  return (
    <>
      {showDriverLicense && (
        <Controller
          name="driverLicenseNumber"
          control={form.control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Numéro de permis de conduire"
              placeholder="Ex: 12AB34567"
              icon={CreditCard}
              disabled={disabled}
            />
          )}
        />
      )}

      {showAddress && (
        <>
          <Controller
            name="street"
            control={form.control}
            render={({ field }) => (
              <AddressAutocomplete
                ref={field.ref}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                onSelect={handleAddressSelect}
                label="Rue"
                placeholder="12 rue de la Paix"
                icon={MapPin}
                hint="Commencez à taper pour rechercher une adresse"
                disabled={disabled}
              />
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="city"
              control={form.control}
              render={({ field }) => (
                <InputField {...field} label="Ville" placeholder="Paris" disabled={disabled} />
              )}
            />
            <Controller
              name="postalCode"
              control={form.control}
              render={({ field }) => (
                <InputField
                  {...field}
                  label="Code postal"
                  placeholder="75000"
                  disabled={disabled}
                />
              )}
            />
          </div>

          <Controller
            name="country"
            control={form.control}
            render={({ field }) => (
              <InputField {...field} label="Pays" placeholder="France" disabled={disabled} />
            )}
          />
        </>
      )}
    </>
  )
}
