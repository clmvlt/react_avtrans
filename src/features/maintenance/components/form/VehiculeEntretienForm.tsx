import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TypeEntretienDTO } from '@/models'
import { getTodayDate } from '@/utils/timeFormatters'
import {
  useCreateEntretienMutation,
  useUpdateEntretienMutation,
} from '../../api/useEntretienMutations'
import { toFixedOffsetDateTime, toIsoDatePart } from '../../lib/entretienDates'
import type { EntretienRow } from '../../lib/entretienRow'
import { numberOrNull } from '../../lib/formNumbers'
import { notifyError, notifySuccess } from '../../lib/notify'
import { toUploadRequest, type PendingFile } from '../../lib/pendingFiles'
import {
  vehiculeEntretienFormSchema,
  type VehiculeEntretienFormValues,
} from '../../schemas/entretienForm'
import { ExistingFilesList } from './ExistingFilesList'
import { PendingFilesInput } from './PendingFilesInput'

type VehiculeEntretienFormProps = {
  vehiculeId: string
  /** Entretien modifié ; `null` en création. */
  entretien: EntretienRow | null
  types: TypeEntretienDTO[]
  onClose: () => void
}

const toDefaultValues = (entretien: EntretienRow | null): VehiculeEntretienFormValues =>
  entretien
    ? {
        typeEntretienId: entretien.typeEntretien?.id || '',
        dateEntretien: toIsoDatePart(entretien.dateEntretien),
        kilometrage: entretien.kilometrage != null ? String(entretien.kilometrage) : '',
        cout: entretien.cout != null ? String(entretien.cout) : '',
        commentaire: entretien.commentaire || '',
      }
    : {
        typeEntretienId: '',
        // Bug B-01 reproduit : date du jour calculée en UTC (la veille entre 0 h et 2 h)
        dateEntretien: getTodayDate(),
        kilometrage: '',
        cout: '',
        commentaire: '',
      }

/**
 * Formulaire de création / modification d'EntretiensVehicule.vue : type (liste à plat), date,
 * kilométrage, coût, commentaire ; fichiers existants (modification) et nouveaux fichiers,
 * envoyés un par un après la modification.
 */
export function VehiculeEntretienForm({
  vehiculeId,
  entretien,
  types,
  onClose,
}: VehiculeEntretienFormProps) {
  const fieldId = useId()
  const isEdit = entretien !== null
  const [files, setFiles] = useState<PendingFile[]>([])
  const createEntretien = useCreateEntretienMutation()
  const updateEntretien = useUpdateEntretienMutation()
  const isPending = createEntretien.isPending || updateEntretien.isPending

  const form = useForm<VehiculeEntretienFormValues>({
    resolver: zodResolver(vehiculeEntretienFormSchema),
    defaultValues: toDefaultValues(entretien),
  })

  const typeOptions = types
    .filter((t) => t.id && t.nom)
    .map((t) => ({ value: t.id!, label: t.nom! }))

  const onSubmit = (values: VehiculeEntretienFormValues) => {
    const onError = () => notifyError("Erreur lors de l'enregistrement de l'entretien")
    let dateEntretien: string
    try {
      // Bug B-21 reproduit : minuit UTC suivi de « +01:00 » codé en dur
      dateEntretien = toFixedOffsetDateTime(values.dateEntretien)
    } catch {
      onError()
      return
    }
    const kilometrage = numberOrNull(values.kilometrage)
    const cout = numberOrNull(values.cout)
    const uploads = files.map(toUploadRequest)

    if (entretien?.id) {
      updateEntretien.mutate(
        {
          id: entretien.id,
          vehiculeId,
          data: {
            typeEntretienId: values.typeEntretienId,
            dateEntretien,
            kilometrage: kilometrage ?? undefined,
            cout: cout ?? undefined,
            commentaire: values.commentaire,
          },
          files: uploads,
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
        vehiculeId,
        typeEntretienId: values.typeEntretienId,
        dateEntretien,
        kilometrage: kilometrage ?? 0,
        cout: cout ?? undefined,
        commentaire: values.commentaire,
        files: uploads.length > 0 ? uploads : undefined,
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
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="typeEntretienId"
        control={form.control}
        render={({ field }) => (
          <Combobox
            label="Type d'entretien"
            required
            options={typeOptions}
            placeholder="Sélectionner un type"
            searchPlaceholder="Rechercher un type..."
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="dateEntretien"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-date`}>Date *</FieldLabel>
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
              <FieldLabel htmlFor={`${fieldId}-km`}>Kilométrage *</FieldLabel>
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
            />
          </Field>
        )}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={`${fieldId}-files`} className="text-sm font-medium text-foreground">
          Fichiers
        </label>
        {entretien?.id && <ExistingFilesList entretienId={entretien.id} />}
        <div className="mt-1">
          {isEdit && (
            <p className="mb-2 text-sm font-medium text-muted-foreground">Ajouter des fichiers :</p>
          )}
          <PendingFilesInput
            id={`${fieldId}-files`}
            layout="grid"
            files={files}
            onFilesChange={setFiles}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          {isPending ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  )
}
