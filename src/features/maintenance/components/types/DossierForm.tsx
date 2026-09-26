import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DossierTypeEntretienDTO } from '@/models'
import { useCreateDossierMutation, useUpdateDossierMutation } from '../../api/useDossierMutations'
import { notifySuccess } from '../../lib/notify'
import { saveErrorMessage } from '../../lib/saveErrorMessage'
import { dossierFormSchema, type DossierFormValues } from '../../schemas/typeEntretien'
import { FormErrorBanner } from './FormErrorBanner'

type DossierFormProps = {
  /** Dossier modifié ; `null` en création. */
  dossier: DossierTypeEntretienDTO | null
  onClose: () => void
}

/**
 * Formulaire d'un dossier de types d'entretien (TypesEntretien.vue) : nom et description, envoyés
 * tels quels (description vide comprise). Une erreur de l'API s'affiche en bandeau.
 */
export function DossierForm({ dossier, onClose }: DossierFormProps) {
  const fieldId = useId()
  const createDossier = useCreateDossierMutation()
  const updateDossier = useUpdateDossierMutation()
  const isEdit = !!dossier?.id
  const mutation = isEdit ? updateDossier : createDossier
  const isPending = mutation.isPending

  const form = useForm<DossierFormValues>({
    resolver: zodResolver(dossierFormSchema),
    defaultValues: { nom: dossier?.nom || '', description: dossier?.description || '' },
  })

  const onSubmit = (values: DossierFormValues) => {
    if (dossier?.id) {
      updateDossier.mutate(
        { id: dossier.id, data: values },
        {
          onSuccess: () => {
            notifySuccess('Dossier modifié avec succès !', 'Succès')
            onClose()
          },
        },
      )
      return
    }

    createDossier.mutate(values, {
      onSuccess: () => {
        notifySuccess('Dossier créé avec succès !', 'Succès')
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
                placeholder="Freinage"
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
                rows={2}
                placeholder="Tous les entretiens liés au système de freinage"
                disabled={isPending}
                className="field-sizing-fixed min-h-[60px] resize-y"
              />
            </Field>
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
