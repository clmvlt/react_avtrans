import { useId } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { CARBURANT_OPTIONS } from '../../lib/carburant'
import type { VehicleFormValues } from '../../schemas/vehicle'

type VehicleCarburantFieldProps = {
  disabled?: boolean
}

/** Type de carburant : liste sans recherche, effaçable (Select maison du Vue, `clearable`). */
export function VehicleCarburantField({ disabled }: VehicleCarburantFieldProps) {
  const id = useId()
  const { control } = useFormContext<VehicleFormValues>()

  return (
    <Controller
      name="typeCarburant"
      control={control}
      render={({ field }) => (
        <Field className="gap-2">
          <FieldLabel htmlFor={id} className="text-sm font-medium text-muted-foreground">
            Carburant
          </FieldLabel>
          <Combobox
            id={id}
            ref={field.ref}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            options={CARBURANT_OPTIONS}
            placeholder="Sélectionner"
            searchable={false}
            clearable
            disabled={disabled}
          />
        </Field>
      )}
    />
  )
}
