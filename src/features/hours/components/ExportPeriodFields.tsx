import { useId } from 'react'
import { Controller, useWatch, type Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { EXPORT_PERIOD_PRESETS, type ExportPeriodPreset } from '../lib/periodPresets'
import type { ExportHoursFormValues } from '../schemas/exportHours'

type ExportPeriodFieldsProps = {
  control: Control<ExportHoursFormValues>
  disabled: boolean
  onPreset: (preset: ExportPeriodPreset) => void
}

/** Section « Période » : dates de début et de fin (natives, bornées l'une par l'autre), préréglages. */
export function ExportPeriodFields({ control, disabled, onPreset }: ExportPeriodFieldsProps) {
  const id = useId()
  const [startDate, endDate] = useWatch({ control, name: ['startDate', 'endDate'] })

  return (
    <div className="border-b pb-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Période</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-start`} className="text-muted-foreground">
                Date de début *
              </FieldLabel>
              <Input
                {...field}
                id={`${id}-start`}
                type="date"
                max={endDate || undefined}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="endDate"
          control={control}
          // L'erreur « début après fin » est portée par la date de début : la revalider aussi
          rules={{ deps: 'startDate' }}
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-end`} className="text-muted-foreground">
                Date de fin *
              </FieldLabel>
              <Input
                {...field}
                id={`${id}-end`}
                type="date"
                min={startDate || undefined}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXPORT_PERIOD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onPreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
