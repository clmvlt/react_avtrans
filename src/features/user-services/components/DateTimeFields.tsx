import type { ReactNode } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { ServiceFormValues } from '../schemas/serviceForm'

type DateTimeFieldsProps = {
  control: Control<ServiceFormValues>
  dateName: 'debutDate' | 'finDate'
  timeName: 'debutTime' | 'finTime'
  /** Libellés accessibles des deux champs (« Date de début »…) */
  dateLabel: string
  timeLabel: string
  /** En-tête : icône et titre (« Début », « Fin »), éventuellement la durée */
  header: ReactNode
}

/** Date et heure natives côte à côte (Q-DATES), avec leurs messages de validation. */
export function DateTimeFields({
  control,
  dateName,
  timeName,
  dateLabel,
  timeLabel,
  header,
}: DateTimeFieldsProps) {
  return (
    <div className="space-y-2">
      {header}
      <div className="grid grid-cols-2 gap-3">
        <Controller
          name={dateName}
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <Input
                {...field}
                type="date"
                required
                aria-label={dateLabel}
                aria-invalid={fieldState.invalid || undefined}
              />
              {fieldState.error && (
                <p role="alert" className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        <Controller
          name={timeName}
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <Input
                {...field}
                type="time"
                required
                aria-label={timeLabel}
                aria-invalid={fieldState.invalid || undefined}
              />
              {fieldState.error && (
                <p role="alert" className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}
