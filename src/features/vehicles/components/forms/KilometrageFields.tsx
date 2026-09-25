import { useId } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { KilometrageFormValues } from '../../schemas/kilometrage'

type KilometrageFieldsProps = {
  kmLabel: string
  /** Libellé du champ date ; sans libellé, le champ n'est pas affiché (mécanicien à l'ajout). */
  dateLabel?: string
  dateHint?: string
  /** Clavier numérique sur mobile (dialog d'ajout). */
  numericKeyboard?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

/** Champs « kilométrage » et « date du relevé » des dialogs d'ajout et de modification. */
export function KilometrageFields({
  kmLabel,
  dateLabel,
  dateHint,
  numericKeyboard = false,
  autoFocus = false,
  disabled,
}: KilometrageFieldsProps) {
  const kmId = useId()
  const dateId = useId()
  const { control } = useFormContext<KilometrageFormValues>()

  return (
    <>
      <Controller
        name="km"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
            <FieldLabel
              htmlFor={kmId}
              className={cn('text-sm font-medium', fieldState.invalid && 'text-destructive')}
            >
              {kmLabel}
            </FieldLabel>
            <Input
              {...field}
              id={kmId}
              type="number"
              inputMode={numericKeyboard ? 'numeric' : undefined}
              min={0}
              placeholder="125000"
              autoFocus={autoFocus}
              disabled={disabled}
              aria-invalid={fieldState.invalid || undefined}
            />
            <FieldError className="text-xs">{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      {dateLabel && (
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={dateId} className="text-sm font-medium">
                {dateLabel}
              </FieldLabel>
              <Input {...field} id={dateId} type="datetime-local" disabled={disabled} />
              {dateHint && <FieldDescription className="text-xs">{dateHint}</FieldDescription>}
            </Field>
          )}
        />
      )}
    </>
  )
}
