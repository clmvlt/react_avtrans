import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { TypeEntretienDTO, VehiculeTypeEntretienDTO } from '@/models'
import {
  useCreateVehiculeConfigMutation,
  useUpdateVehiculeConfigMutation,
} from '../../api/useVehiculeConfigMutations'
import { notifyError, notifySuccess } from '../../lib/notify'
import {
  createConfigEntretienSchema,
  type ConfigEntretienFormValues,
} from '../../schemas/configEntretien'

const PERIODICITE_OPTIONS = [
  { value: 'KILOMETRAGE', label: 'Kilométrage (km)' },
  { value: 'TEMPOREL', label: 'Temporel (jours)' },
]

type ConfigEntretienFormProps = {
  vehiculeId: string
  /** Types pas encore configurés pour ce véhicule (liste de la création). */
  availableTypes: TypeEntretienDTO[]
  /** Configuration modifiée ; `null` en création. */
  config: VehiculeTypeEntretienDTO | null
  onClose: () => void
}

const toDefaultValues = (config: VehiculeTypeEntretienDTO | null): ConfigEntretienFormValues => ({
  typeEntretienId: config?.typeEntretien?.id || '',
  periodiciteType: config?.periodiciteType || 'KILOMETRAGE',
  periodiciteValeur: config?.periodiciteValeur ? String(config.periodiciteValeur) : '',
  actif: config?.actif ?? true,
})

/**
 * Formulaire de ConfigEntretienModal.vue : type (création seulement, lecture seule en
 * modification), type de périodicité, valeur, et « Configuration active » en modification.
 */
export function ConfigEntretienForm({
  vehiculeId,
  availableTypes,
  config,
  onClose,
}: ConfigEntretienFormProps) {
  const fieldId = useId()
  const isEdit = config !== null
  const createConfig = useCreateVehiculeConfigMutation()
  const updateConfig = useUpdateVehiculeConfigMutation()
  const isPending = createConfig.isPending || updateConfig.isPending

  const form = useForm<ConfigEntretienFormValues>({
    resolver: zodResolver(createConfigEntretienSchema(isEdit)),
    defaultValues: toDefaultValues(config),
  })
  const periodiciteType = useWatch({ control: form.control, name: 'periodiciteType' })
  const isTemporel = periodiciteType === 'TEMPOREL'

  const typeOptions = availableTypes
    .filter((t) => t.id && t.nom)
    .map((t) => ({ value: t.id!, label: t.nom! }))

  const onSubmit = (values: ConfigEntretienFormValues) => {
    if (!vehiculeId) return
    const periodiciteValeur = Number(values.periodiciteValeur)
    const onError = () => notifyError("Erreur lors de l'enregistrement de la configuration")

    if (config?.id) {
      updateConfig.mutate(
        {
          id: config.id,
          vehiculeId,
          data: { periodiciteType: values.periodiciteType, periodiciteValeur, actif: values.actif },
        },
        {
          onSuccess: () => {
            notifySuccess('Configuration modifiée avec succès')
            onClose()
          },
          onError,
        },
      )
      return
    }

    createConfig.mutate(
      {
        vehiculeId,
        typeEntretienId: values.typeEntretienId,
        periodiciteType: values.periodiciteType,
        periodiciteValeur,
      },
      {
        onSuccess: () => {
          notifySuccess('Configuration ajoutée avec succès')
          onClose()
        },
        onError,
      },
    )
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {isEdit ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">Type d&apos;entretien</span>
          <div className="rounded-md bg-muted p-3 text-sm font-semibold text-foreground">
            {config.typeEntretien?.nom}
          </div>
        </div>
      ) : (
        <Controller
          name="typeEntretienId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-type`}>Type d&apos;entretien *</FieldLabel>
              <Combobox
                id={`${fieldId}-type`}
                options={typeOptions}
                placeholder="Sélectionner un type"
                searchPlaceholder="Rechercher un type..."
                error={fieldState.error?.message}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </Field>
          )}
        />
      )}

      <Controller
        name="periodiciteType"
        control={form.control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${fieldId}-periodicite`}>Type de périodicité *</FieldLabel>
            <Combobox
              id={`${fieldId}-periodicite`}
              options={PERIODICITE_OPTIONS}
              placeholder="Sélectionner un type"
              searchable={false}
              value={field.value}
              onValueChange={(value) => {
                // Pas d'effacement possible (liste non « clearable ») : on ignore une valeur vide
                if (value === 'KILOMETRAGE' || value === 'TEMPOREL') field.onChange(value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </Field>
        )}
      />

      <Controller
        name="periodiciteValeur"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${fieldId}-valeur`} className="gap-1">
              Valeur *
              <span className="font-normal text-muted-foreground">
                ({isTemporel ? 'jours' : 'km'})
              </span>
            </FieldLabel>
            <Input
              {...field}
              id={`${fieldId}-valeur`}
              type="number"
              min={1}
              placeholder={isTemporel ? '365' : '30000'}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {isEdit && (
        <Controller
          name="actif"
          control={form.control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm leading-none font-medium">Configuration active</span>
                <span className="text-xs text-muted-foreground">
                  Activer le suivi de cet entretien
                </span>
              </div>
            </label>
          )}
        />
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          {isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </DialogFooter>
    </form>
  )
}
