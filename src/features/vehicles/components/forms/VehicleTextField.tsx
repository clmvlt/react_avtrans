import { useId, type ComponentProps } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { VehicleFormValues } from '../../schemas/vehicle'

type VehicleTextFieldProps = Omit<
  ComponentProps<'input'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id'
> & {
  name: keyof VehicleFormValues
  label: string
  /** Saisie forcée en majuscules (immatriculations, VIN). */
  uppercase?: boolean
  /** Classes de l'input (`className` s'applique au conteneur). */
  inputClassName?: string
}

/** Champ texte, date ou nombre du formulaire véhicule (libellé gris au-dessus, erreur en dessous). */
export function VehicleTextField({
  name,
  label,
  uppercase = false,
  className,
  inputClassName,
  ...props
}: VehicleTextFieldProps) {
  const id = useId()
  const { control } = useFormContext<VehicleFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={cn('gap-2', className)} data-invalid={fieldState.invalid || undefined}>
          <FieldLabel
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-muted-foreground',
              fieldState.invalid && 'text-destructive',
            )}
          >
            {label}
          </FieldLabel>
          <Input
            {...props}
            {...field}
            id={id}
            onChange={(event) =>
              field.onChange(uppercase ? event.target.value.toUpperCase() : event.target.value)
            }
            aria-invalid={fieldState.invalid || undefined}
            className={inputClassName}
          />
          <FieldError className="text-xs">{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  )
}
