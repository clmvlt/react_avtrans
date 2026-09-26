import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import type { CarteDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'
import { useSaveCarteMutation } from '../api/useSaveCarteMutation'
import { useTypeCartesQuery } from '../api/useTypeCartesQuery'
import { userOptionLabel } from '../lib/cartes'
import { toCarteCreateRequest, toCarteFormValues, toCarteUpdateRequest } from '../lib/carteForm'
import { carteFormSchema, type CarteFormValues } from '../schemas/carteForm'
import { CarteSystemInfo } from './CarteSystemInfo'

type CarteFormProps = {
  isCreating: boolean
  carteUuid?: string
  /** Carte chargée en édition (valeurs initiales et informations système). */
  carte: CarteDTO | null
  /** Erreur de chargement de la carte, affichée en haut du formulaire (vide sinon). */
  loadError: string
  onCancel: () => void
  onSaved: () => void
}

/**
 * Champs du formulaire de carte. Types et utilisateurs sont rechargés à l'ouverture ; comme le
 * Vue, un échec de ces référentiels n'est pas signalé (liste vide, B-31). Le sélecteur
 * d'utilisateur ne propose que les comptes visibles, plus le titulaire actuel même masqué.
 */
export function CarteForm({
  isCreating,
  carteUuid,
  carte,
  loadError,
  onCancel,
  onSaved,
}: CarteFormProps) {
  const saveMutation = useSaveCarteMutation()
  const typeCartesQuery = useTypeCartesQuery()
  const usersQuery = useUsersQuery()
  const isPending = saveMutation.isPending

  const form = useForm<CarteFormValues>({
    resolver: zodResolver(carteFormSchema),
    mode: 'onTouched',
    defaultValues: toCarteFormValues(carte),
  })
  // Abonnement dédié : suit la validité même si le React Compiler mémoïse le rendu
  const { isValid } = useFormState({ control: form.control })

  const typeOptions = (typeCartesQuery.data ?? []).map((type) => ({
    value: type.uuid || '',
    label: type.nom || 'Type inconnu',
  }))

  const submitErrorFallback = `Erreur lors de ${isCreating ? 'la création' : 'la modification'}`

  const onSubmit = (values: CarteFormValues) => {
    if (!isCreating && !carteUuid) {
      onSaved()
      return
    }
    const variables = isCreating
      ? { data: toCarteCreateRequest(values) }
      : { uuid: carteUuid ?? '', data: toCarteUpdateRequest(values) }
    saveMutation.mutate(variables, {
      onSuccess: () => {
        toast.success('Succès', {
          description: isCreating ? 'Carte créée avec succès !' : 'Carte modifiée avec succès !',
        })
        onSaved()
      },
      onError: (error) =>
        toast.error('Erreur', {
          description: (error instanceof Error && error.message) || submitErrorFallback,
        }),
    })
  }

  // Comme le Vue : l'erreur de chargement s'efface dès qu'un enregistrement est lancé
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
            label="Nom de la carte"
            required
            placeholder="Ex: Carte entreprise principale"
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
            placeholder="Description de la carte (optionnel)"
            disabled={isPending}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="numero"
          control={form.control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Numéro de carte"
              placeholder="4111 1111 1111 1111"
              hint="Numéro complet de la carte (optionnel)"
              disabled={isPending}
            />
          )}
        />
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              type="password"
              label="Code PIN"
              required
              placeholder="****"
              hint="Code à 4 chiffres"
              disabled={isPending}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <Controller
        name="dateExpiration"
        control={form.control}
        render={({ field }) => (
          <InputField
            {...field}
            type="date"
            label="Date d'expiration"
            hint="Date d'expiration de la carte (optionnel)"
            disabled={isPending}
          />
        )}
      />

      <Controller
        name="typeCarteUuid"
        control={form.control}
        render={({ field: { value, onChange, ...field }, fieldState }) => (
          <Combobox
            {...field}
            label="Type de carte"
            required
            options={typeOptions}
            value={value}
            onValueChange={onChange}
            placeholder="Sélectionner un type"
            searchPlaceholder="Rechercher un type..."
            noResultsText="Aucun type trouvé"
            disabled={isPending}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="userUuid"
        control={form.control}
        render={({ field: { value, onChange, ...field } }) => (
          <Combobox
            {...field}
            label="Utilisateur associé"
            options={selectableUsers(usersQuery.data, [value]).map((user) => ({
              value: user.uuid || '',
              label: userOptionLabel(user),
            }))}
            value={value}
            onValueChange={onChange}
            placeholder="Sélectionner un utilisateur (optionnel)"
            searchPlaceholder="Rechercher un utilisateur..."
            noResultsText="Aucun utilisateur trouvé"
            clearable
            disabled={isPending}
          />
        )}
      />

      {carte && !isCreating && (
        <CarteSystemInfo
          uuid={carte.uuid}
          createdAt={carte.createdAt}
          updatedAt={carte.updatedAt}
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
