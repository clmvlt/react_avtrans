import { useId } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { VehicleFormValues } from '../../schemas/vehicle'

type VehicleCommentFieldProps = {
  placeholder: string
  disabled?: boolean
}

/** Commentaire libre du véhicule (textarea de 3 lignes). */
export function VehicleCommentField({ placeholder, disabled }: VehicleCommentFieldProps) {
  const id = useId()
  const { control } = useFormContext<VehicleFormValues>()

  return (
    <Controller
      name="comment"
      control={control}
      render={({ field }) => (
        <Field className="gap-2">
          <FieldLabel htmlFor={id} className="text-sm font-medium text-muted-foreground">
            Commentaire
          </FieldLabel>
          <Textarea
            {...field}
            id={id}
            rows={3}
            placeholder={placeholder}
            disabled={disabled}
            className="field-sizing-fixed bg-background dark:bg-background"
          />
        </Field>
      )}
    />
  )
}
