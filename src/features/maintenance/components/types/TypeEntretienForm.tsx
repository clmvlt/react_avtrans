import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'
import {
  useCreateTypeEntretienMutation,
  useUpdateTypeEntretienMutation,
} from '../../api/useTypeEntretienMutations'
import { notifySuccess } from '../../lib/notify'
import { saveErrorMessage } from '../../lib/saveErrorMessage'
import { typeEntretienFormSchema, type TypeEntretienFormValues } from '../../schemas/typeEntretien'
import { FormErrorBanner } from './FormErrorBanner'

type TypeEntretienFormProps = {
  /** Type modifié ; `null` en création. */
  type: TypeEntretienDTO | null
  /** Dossier pré-rempli à la création (dossier affiché, sauf « Tous » et « Non classés »). */
  defaultDossierId: string
  dossiers: DossierTypeEntretienDTO[]
  onClose: () => void
}

/**
 * Formulaire d'un type d'entretien (TypesEntretien.vue) : nom, description, dossier. Une erreur
 * de l'API s'affiche en bandeau au-dessus des champs, sans toast.
 *
 * Une description ou un dossier vidés sont omis (`undefined`), comme le Vue : l'API les laisse
 * alors inchangés, on ne peut ni retirer un type de son dossier ni effacer sa description
 * (MIGRATION.md 8.3, reproduit).
 */
export function TypeEntretienForm({
  type,
  defaultDossierId,
  dossiers,
  onClose,
}: TypeEntretienFormProps) {
  const fieldId = useId()
  const createType = useCreateTypeEntretienMutation()
  const updateType = useUpdateTypeEntretienMutation()
  const isEdit = !!type?.id
  const mutation = isEdit ? updateType : createType
  const isPending = mutation.isPending

  const form = useForm<TypeEntretienFormValues>({
    resolver: zodResolver(typeEntretienFormSchema),
    defaultValues: type
      ? {
          nom: type.nom || '',
          description: type.description || '',
          dossierId: type.dossier?.id || '',
        }
      : { nom: '', description: '', dossierId: defaultDossierId },
  })

  const dossierOptions = dossiers.map((d) => ({ value: d.id || '', label: d.nom || '' }))

  const onSubmit = (values: TypeEntretienFormValues) => {
    const data = {
      nom: values.nom,
      description: values.description || undefined,
      dossierId: values.dossierId || undefined,
    }

    if (type?.id) {
      updateType.mutate(
        { id: type.id, data },
        {
          onSuccess: () => {
            notifySuccess('Type modifié avec succès !', 'Succès')
            onClose()
          },
        },
      )
      return
    }

    createType.mutate(data, {
      onSuccess: () => {
        notifySuccess('Type créé avec succès !', 'Succès')
        onClose()
      },
    })
  }

  return (
    <>
      {mutation.isError && <FormErrorBanner message={saveErrorMessage(mutation.error)} />}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="nom"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-nom`}>Nom *</FieldLabel>
              <Input
                {...field}
                id={`${fieldId}-nom`}
                type="text"
                placeholder="Changement freins avant"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={`${fieldId}-description`}>Description</FieldLabel>
              <Textarea
                {...field}
                id={`${fieldId}-description`}
                rows={3}
                placeholder="Remplacement des plaquettes et disques de frein avant"
                disabled={isPending}
                className="field-sizing-fixed min-h-[80px] resize-y"
              />
            </Field>
          )}
        />

        <Controller
          name="dossierId"
          control={form.control}
          render={({ field }) => (
            <Combobox
              label="Dossier"
              options={dossierOptions}
              placeholder="Aucun dossier"
              clearable
              disabled={isPending}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <LoaderCircle className="mr-1.5 size-4 animate-spin" />}
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
