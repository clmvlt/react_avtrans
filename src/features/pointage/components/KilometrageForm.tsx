import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, Repeat } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { describeRelaiVehicle } from '@/features/vehicles/lib/relais'
import type { VehiculeRelaiDTO } from '@/models'
import {
  kilometrageSchema,
  type KilometrageFormValues,
  type KilometrageInput,
} from '../schemas/kilometrage'

type KilometrageFormProps = {
  vehicleOptions: ComboboxOption[]
  /** Relais en cours par véhicule (D9) : son compteur remplace celui du véhicule. */
  relaiByVehicule: Record<string, VehiculeRelaiDTO>
  vehiclesLoading: boolean
  /** Véhicule présélectionné (celui du dernier relevé) */
  defaultVehiculeId: string
  isSaving: boolean
  onSubmit: (values: KilometrageInput) => void
}

/**
 * Formulaire du dialog de kilométrage : véhicule (avec recherche) et kilométrage actuel. Si le
 * véhicule choisi est remplacé par un relais (D9), le formulaire demande le compteur du relais.
 */
export function KilometrageForm({
  vehicleOptions,
  relaiByVehicule,
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
  const relai = vehiculeId ? relaiByVehicule[vehiculeId] : undefined

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) =>
        onSubmit({ vehiculeId: values.vehiculeId, km: Number(values.km) }),
      )}
      // min-w-0 : un libellé de véhicule long ne doit pas élargir le dialog (élément de grille)
      className="flex min-w-0 flex-col gap-4"
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

      {relai && (
        <p className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <Repeat className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Véhicule remplacé par le relais{' '}
            <span className="font-semibold tracking-wide uppercase">{relai.immat}</span>
            {`${describeRelaiVehicle(relai) ? ` (${describeRelaiVehicle(relai)})` : ''} : relevez le compteur du véhicule relais.`}
          </span>
        </p>
      )}

      <Controller
        name="km"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={kmId} className="text-sm font-medium text-muted-foreground">
              {relai ? 'Kilométrage du relais *' : 'Kilométrage actuel *'}
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
