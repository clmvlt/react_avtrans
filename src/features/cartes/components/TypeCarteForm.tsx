import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { TypeCarteDTO } from '@/models'
import { useSaveTypeCarteMutation } from '../api/useSaveTypeCarteMutation'
import { typeCarteFormSchema, type TypeCarteFormValues } from '../schemas/typeCarteForm'
import { CarteSystemInfo } from './CarteSystemInfo'

type TypeCarteFormProps = {
  isCreating: boolean
  typeCarteUuid?: string
  /** Type chargé en édition (valeurs initiales et informations système). */
  typeCarte: TypeCarteDTO | null
  /** Erreur de chargement du type, affichée en haut du formulaire (vide sinon). */
  loadError: string
  onCancel: () => void
  onSaved: () => void
}

/**
 * Champs du formulaire de type de carte. Une description vidée en modification est omise :
 * l'API la laisse inchangée (MIGRATION.md 8.3, reproduit).
 */
export function TypeCarteForm({
  isCreating,
  typeCarteUuid,
  typeCarte,
  loadError,
  onCancel,
  onSaved,
}: TypeCarteFormProps) {
  const saveMutation = useSaveTypeCarteMutation()
  const isPending = saveMutation.isPending

  const form = useForm<TypeCarteFormValues>({
    resolver: zodResolver(typeCarteFormSchema),
    mode: 'onTouched',
    defaultValues: { nom: typeCarte?.nom || '', description: typeCarte?.description || '' },
  })
  // Abonnement dédié : suit la validité même si le React Compiler mémoïse le rendu
  const { isValid } = useFormState({ control: form.control })

  const submitErrorFallback = `Erreur lors de ${isCreating ? 'la création' : 'la modification'}`

  const onSubmit = (values: TypeCarteFormValues) => {
    if (!isCreating && !typeCarteUuid) {
      onSaved()
      return
    }
    const data = { nom: values.nom.trim(), description: values.description.trim() || undefined }
    saveMutation.mutate(
      { uuid: isCreating ? undefined : typeCarteUuid, data },
      {
        onSuccess: () => {
          toast.success('Succès', {
            description: isCreating
              ? 'Type de carte créé avec succès !'
              : 'Type de carte modifié avec succès !',
          })
          onSaved()
        },
        onError: (error) =>
          toast.error('Erreur', {
            description: (error instanceof Error && error.message) || submitErrorFallback,
          }),
      },
    )
  }

  const errorMessage = saveMutation.isIdle
    ? loadError
    : saveMutation.isError
      ? (saveMutation.error instanceof Error && saveMutation.error.message) || submitErrorFallback
      : ''

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <Controller
        name="nom"
        control={form.control}
        render={({ field, fieldState }) => (
          <InputField
            {...field}
            label="Nom"
            required
            placeholder="Ex: Bancaire, Carburant..."
            disabled={isPending}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <InputField
            {...field}
            label="Description"
            placeholder="Description du type de carte (optionnel)"
            disabled={isPending}
          />
        )}
      />

      {typeCarte && !isCreating && (
        <CarteSystemInfo
          uuid={typeCarte.uuid}
          createdAt={typeCarte.createdAt}
          updatedAt={typeCarte.updatedAt}
        />
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || !isValid}>
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          {isCreating ? 'Créer' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </form>
  )
}
