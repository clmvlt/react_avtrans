import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  kilometrageSchema,
  type KilometrageFormValues,
  type KilometrageInput,
} from '../schemas/kilometrage'

type KilometrageFormProps = {
  vehicleOptions: ComboboxOption[]
  vehiclesLoading: boolean
  /** Véhicule présélectionné (celui du dernier relevé) */
  defaultVehiculeId: string
  isSaving: boolean
  onSubmit: (values: KilometrageInput) => void
}

/** Formulaire du dialog de kilométrage : véhicule (avec recherche) et kilométrage actuel. */
export function KilometrageForm({
  vehicleOptions,
  vehiclesLoading,
  defaultVehiculeId,
  isSaving,
  onSubmit,
}: KilometrageFormProps) {
  const kmId = useId()
  const form = useForm<KilometrageFormValues>({
    resolver: zodResolver(kilometrageSchema),
    defaultValues: { vehiculeId: defaultVehiculeId, km: '' },
  })
  const [vehiculeId, km] = useWatch({ control: form.control, name: ['vehiculeId', 'km'] })
  // Comme le Vue : bouton désactivé sans véhicule ni kilométrage non nul
  const canSubmit = !!vehiculeId && !!Number(km) && !isSaving

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) =>
        onSubmit({ vehiculeId: values.vehiculeId, km: Number(values.km) }),
      )}
      className="flex flex-col gap-4"
    >
      <Controller
        name="vehiculeId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Combobox
            ref={field.ref}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            label="Véhicule"
            options={vehicleOptions}
            placeholder="Sélectionner un véhicule..."
            searchPlaceholder="Rechercher par immat, marque..."
            noResultsText="Aucun véhicule trouvé"
            disabled={isSaving || vehiclesLoading}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="km"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={kmId} className="text-sm font-medium text-muted-foreground">
              Kilométrage actuel *
            </FieldLabel>
            <Input
              {...field}
              id={kmId}
              type="number"
              inputMode="numeric"
              required
              min={0}
              disabled={isSaving}
              placeholder="Ex: 125000"
              aria-invalid={fieldState.invalid || undefined}
              // Le Vue place le curseur dans ce champ à l'ouverture du dialog
              autoFocus
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
        Enregistrer
      </Button>
    </form>
  )
}
