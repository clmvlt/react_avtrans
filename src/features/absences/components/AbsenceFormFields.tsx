import { useId } from 'react'
import { Controller, useWatch, type Control } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AbsencePeriod } from '@/enums/AbsencePeriod'
import type { AbsenceTypeDTO } from '@/models'
import { cn } from '@/lib/utils'
import { CUSTOM_ABSENCE_TYPE, type AbsenceFormValues } from '../schemas/absence'

type AbsenceFormFieldsProps = {
  control: Control<AbsenceFormValues>
  absenceTypes: AbsenceTypeDTO[]
  disabled?: boolean
  /**
   * Mise en page et libellés du formulaire admin (AbsenceEditModal) ou de la demande employé
   * (MyAbsenceEditModal) : grille des dates, boutons de période, texte d'exemple du motif.
   */
  variant: 'admin' | 'my'
}

const PERIOD_OPTIONS = [
  { value: AbsencePeriod.FULL_DAY, admin: 'Journée entière', my: 'Journée' },
  { value: AbsencePeriod.MORNING, admin: 'Matin', my: 'Matin' },
  { value: AbsencePeriod.AFTERNOON, admin: 'Après-midi', my: 'Après-midi' },
]

/**
 * Champs communs aux formulaires d'absence (admin et employé) : dates, période, type (avec
 * « Autre (personnalisé) »), type personnalisé et motif.
 */
export function AbsenceFormFields({
  control,
  absenceTypes,
  disabled = false,
  variant,
}: AbsenceFormFieldsProps) {
  const id = useId()
  const absenceTypeUuid = useWatch({ control, name: 'absenceTypeUuid' })
  const isAdmin = variant === 'admin'

  const typeOptions = [
    ...absenceTypes
      .filter((type) => type.uuid && type.name)
      .map((type) => ({ value: type.uuid!, label: type.name! })),
    { value: CUSTOM_ABSENCE_TYPE, label: 'Autre (personnalisé)' },
  ]

  return (
    <>
      {/* Dates */}
      <div
        className={cn(
          'grid',
          isAdmin ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4',
        )}
      >
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${id}-start`}>Date de début *</FieldLabel>
              <Input
                {...field}
                id={`${id}-start`}
                type="date"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${id}-end`}>Date de fin *</FieldLabel>
              <Input
                {...field}
                id={`${id}-end`}
                type="date"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Période */}
      <Controller
        name="period"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span id={`${id}-period`} className="text-sm font-medium text-foreground">
              Période
            </span>
            <div
              role="group"
              aria-labelledby={`${id}-period`}
              className={isAdmin ? 'flex gap-2' : 'grid grid-cols-3 gap-2'}
            >
              {PERIOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={field.value === option.value ? 'default' : 'outline'}
                  aria-pressed={field.value === option.value}
                  className={isAdmin ? undefined : 'w-full px-2'}
                  disabled={disabled}
                  onClick={() => field.onChange(option.value)}
                >
                  {isAdmin ? option.admin : option.my}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      {/* Type d'absence */}
      <Controller
        name="absenceTypeUuid"
        control={control}
        render={({ field: { onChange, ...field }, fieldState }) => (
          <Combobox
            {...field}
            label="Type d'absence *"
            options={typeOptions}
            placeholder="Sélectionner un type"
            searchPlaceholder="Rechercher un type..."
            disabled={disabled}
            error={fieldState.error?.message}
            onValueChange={onChange}
          />
        )}
      />

      {/* Type personnalisé */}
      {absenceTypeUuid === CUSTOM_ABSENCE_TYPE && (
        <Controller
          name="customType"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${id}-custom`}>Type personnalisé *</FieldLabel>
              <Input
                {...field}
                id={`${id}-custom`}
                type="text"
                placeholder="Ex: Formation, Événement familial..."
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {/* Motif */}
      <Controller
        name="reason"
        control={control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${id}-reason`}>Motif</FieldLabel>
            <Textarea
              {...field}
              id={`${id}-reason`}
              placeholder={
                isAdmin ? "Motif de l'absence..." : 'Décrivez la raison de votre absence...'
              }
              disabled={disabled}
              className="min-h-20"
            />
          </Field>
        )}
      />
    </>
  )
}
