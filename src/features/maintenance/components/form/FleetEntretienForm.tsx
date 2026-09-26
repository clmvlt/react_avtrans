import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DossierTypeEntretienDTO, TypeEntretienDTO, VehiculeDTO } from '@/models'
import {
  useCreateEntretienMutation,
  useUpdateEntretienMutation,
} from '../../api/useEntretienMutations'
import { toNoonDateTime } from '../../lib/entretienDates'
import type { EntretienRow } from '../../lib/entretienRow'
import { truthyNumberOrNull } from '../../lib/formNumbers'
import { notifyError, notifySuccess } from '../../lib/notify'
import { toUploadRequest, type PendingFile } from '../../lib/pendingFiles'
import {
  fleetEntretienFormSchema,
  type FleetEntretienFormValues,
} from '../../schemas/entretienForm'
import { PendingFilesInput } from './PendingFilesInput'
import { TypeEntretienPicker } from './TypeEntretienPicker'

type FleetEntretienFormProps = {
  /** Entretien modifié ; `null` en création. */
  entretien: EntretienRow | null
  defaultValues: FleetEntretienFormValues
  vehicules: VehiculeDTO[]
  dossiers: DossierTypeEntretienDTO[]
  types: TypeEntretienDTO[]
  /** Le dossier du sélecteur a changé (suivi du bug B-05). */
  onDossierChange: (dossierId: string) => void
  onClose: () => void
}

/**
 * Formulaire de création / modification d'Entretiens.vue : véhicule (verrouillé en
 * modification), sélecteur « Dossier › Type », date (midi, sans fuseau), kilométrage, coût,
 * commentaire, et fichiers à la création seulement.
 */
export function FleetEntretienForm({
  entretien,
  defaultValues,
  vehicules,
  dossiers,
  types,
  onDossierChange,
  onClose,
}: FleetEntretienFormProps) {
  const fieldId = useId()
  const isEdit = entretien !== null
  const [files, setFiles] = useState<PendingFile[]>([])
  const createEntretien = useCreateEntretienMutation()
  const updateEntretien = useUpdateEntretienMutation()
  const isPending = createEntretien.isPending || updateEntretien.isPending

  const form = useForm<FleetEntretienFormValues>({
    resolver: zodResolver(fleetEntretienFormSchema),
    defaultValues,
  })
  const [dossierId, typeEntretienId] = useWatch({
    control: form.control,
    name: ['dossierId', 'typeEntretienId'],
  })

  const vehiculeOptions = vehicules
    .filter((v) => v.id)
    .map((v) => ({ value: v.id!, label: `${v.brand} ${v.model} (${v.immat})` }))

  const handleDossierChange = (id: string) => {
    form.setValue('dossierId', id)
    // Watcher du Vue : changer de dossier vide le type choisi
    form.setValue('typeEntretienId', '')
    onDossierChange(id)
  }

  const onSubmit = (values: FleetEntretienFormValues) => {
    const dateEntretien = toNoonDateTime(values.dateEntretien)
    const kilometrage = truthyNumberOrNull(values.kilometrage)
    const cout = truthyNumberOrNull(values.cout)
    const onError = () => notifyError("Erreur lors de l'enregistrement de l'entretien")

    if (entretien?.id) {
      updateEntretien.mutate(
        {
          id: entretien.id,
          vehiculeId: entretien.vehiculeId,
          data: {
            typeEntretienId: values.typeEntretienId,
            dateEntretien,
            kilometrage: kilometrage ?? undefined,
            cout: cout ?? undefined,
            commentaire: values.commentaire,
          },
        },
        {
          onSuccess: () => {
            notifySuccess('Entretien modifié avec succès')
            onClose()
          },
          onError,
        },
      )
      return
    }

    createEntretien.mutate(
      {
        vehiculeId: values.vehiculeId,
        typeEntretienId: values.typeEntretienId,
        dateEntretien,
        kilometrage: kilometrage ?? 0,
        cout: cout ?? undefined,
        commentaire: values.commentaire,
        files: files.length > 0 ? files.map(toUploadRequest) : undefined,
      },
      {
        onSuccess: () => {
          notifySuccess('Entretien créé avec succès')
          onClose()
        },
        onError,
      },
    )
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="vehiculeId"
        control={form.control}
        render={({ field }) => (
          <Combobox
            label="Véhicule"
            required
            options={vehiculeOptions}
            placeholder="Sélectionner un véhicule"
            searchPlaceholder="Rechercher un véhicule..."
            disabled={isEdit}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <TypeEntretienPicker
        dossiers={dossiers}
        types={types}
        dossierId={dossierId}
        typeEntretienId={typeEntretienId}
        onDossierChange={handleDossierChange}
        onTypeChange={(id) => form.setValue('typeEntretienId', id)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="dateEntretien"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-date`} className="gap-1">
                Date <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={`${fieldId}-date`}
                type="date"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="kilometrage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-km`} className="gap-1">
                Kilométrage <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={`${fieldId}-km`}
                type="number"
                placeholder="150000"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <Controller
        name="cout"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${fieldId}-cout`}>Coût HT (€)</FieldLabel>
            <Input
              {...field}
              id={`${fieldId}-cout`}
              type="number"
              step="0.01"
              placeholder="0.00"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="commentaire"
        control={form.control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${fieldId}-commentaire`}>Commentaire</FieldLabel>
            <Textarea
              {...field}
              id={`${fieldId}-commentaire`}
              rows={4}
              placeholder="Détails sur l'entretien..."
              className="field-sizing-fixed"
            />
          </Field>
        )}
      />

      {!isEdit && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${fieldId}-files`} className="text-sm font-medium text-foreground">
            Fichiers
          </label>
          <PendingFilesInput
            id={`${fieldId}-files`}
            layout="list"
            files={files}
            onFilesChange={setFiles}
          />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="size-3.5 animate-spin" />}
          {isPending ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  )
}
