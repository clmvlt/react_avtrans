import { useId } from 'react'
import { Controller, useWatch, type Control } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MODE_DECOMPTE_OPTIONS, getModeDecompteOption } from '../../lib/absenceDecompte'
import type { AbsenceTypeFormValues } from '../../schemas/absenceType'

type AbsenceTypeHoursFieldsProps = {
  control: Control<AbsenceTypeFormValues>
  disabled?: boolean
}

/**
 * Réglages d'heures d'un type d'absence (D8) : mode de décompte des jours et crédit d'heures
 * (décoché pour un congé sans solde).
 */
export function AbsenceTypeHoursFields({ control, disabled = false }: AbsenceTypeHoursFieldsProps) {
  const id = useId()
  const mode = useWatch({ control, name: 'modeDecompte' })

  return (
    <>
      <Controller
        name="modeDecompte"
        control={control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${id}-mode`}>Décompte des jours</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger id={`${id}-mode`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_DECOMPTE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{getModeDecompteOption(mode).description}</FieldDescription>
          </Field>
        )}
      />

      <Controller
        name="compteHeures"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm leading-none font-medium">Compte dans les heures</span>
              <span className="text-xs text-muted-foreground">
                L&apos;absence crédite les heures du contrat (à décocher pour un congé sans solde)
              </span>
            </div>
          </label>
        )}
      />
    </>
  )
}
