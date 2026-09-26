import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import type { StockItemCreateRequest } from '@/services'
import { useSaveStockItemMutation } from '../api/useSaveStockItemMutation'
import { DEFAULT_UNITE, UNITE_OPTIONS } from '../lib/stock'
import { stockItemSchema, type StockItemFormValues } from '../schemas/stockItem'

type StockItemFormProps = {
  /** Article modifié ; `null` en création. */
  item: StockItemDTO | null
  /** Catégorie présélectionnée en création (celle affichée, hors « Non classés »). */
  defaultCategoryId: string
  categories: StockCategoryDTO[]
  onCancel: () => void
  onSaved: () => void
}

function toFormValues(item: StockItemDTO | null, defaultCategoryId: string): StockItemFormValues {
  if (!item) {
    return {
      reference: '',
      nom: '',
      description: '',
      quantite: '0',
      prixUnitaire: '',
      unite: DEFAULT_UNITE,
      categoryId: defaultCategoryId,
    }
  }
  return {
    reference: item.reference || '',
    nom: item.nom || '',
    description: item.description || '',
    quantite: String(item.quantite || 0),
    prixUnitaire: item.prixUnitaire != null ? String(item.prixUnitaire) : '',
    unite: item.unite || DEFAULT_UNITE,
    categoryId: item.category?.id || '',
  }
}

/**
 * Formulaire d'article (création ou modification). Erreur d'API affichée en haut du dialog,
 * sans toast, comme le Vue. Une catégorie vidée en modification est omise du JSON : l'API
 * l'ignore et l'article reste classé malgré le succès annoncé (MIGRATION.md 8.3, reproduit).
 */
export function StockItemForm({
  item,
  defaultCategoryId,
  categories,
  onCancel,
  onSaved,
}: StockItemFormProps) {
  const saveMutation = useSaveStockItemMutation()
  const isPending = saveMutation.isPending

  const form = useForm<StockItemFormValues>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: toFormValues(item, defaultCategoryId),
  })

  const categoryOptions = categories
    .filter((category) => category.id && category.nom)
    .map((category) => ({ value: category.id ?? '', label: category.nom ?? '' }))

  const onSubmit = (values: StockItemFormValues) => {
    const data: StockItemCreateRequest = {
      reference: values.reference,
      nom: values.nom,
      description: values.description || undefined,
      quantite: Number(values.quantite),
      prixUnitaire: values.prixUnitaire === '' ? undefined : Number(values.prixUnitaire),
      unite: values.unite,
      categoryId: values.categoryId || undefined,
    }
    saveMutation.mutate(
      { id: item?.id, data },
      {
        onSuccess: () => {
          toast.success('Succès', {
            description: item ? 'Article modifié avec succès !' : 'Article créé avec succès !',
          })
          onSaved()
        },
      },
    )
  }

  const errorMessage = saveMutation.isError
    ? (saveMutation.error instanceof Error && saveMutation.error.message) ||
      "Erreur lors de l'enregistrement"
    : ''

  return (
    <>
      {errorMessage && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="reference"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Référence"
                required
                placeholder="FRN-PAD-001"
                disabled={isPending}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="nom"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Nom"
                required
                placeholder="Plaquettes de frein"
                disabled={isPending}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="stock-item-description">Description</FieldLabel>
              <Textarea
                {...field}
                id="stock-item-description"
                rows={2}
                placeholder="Description de l'article..."
                disabled={isPending}
                className="min-h-[60px] resize-y"
              />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="quantite"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="number"
                label="Quantité"
                required
                placeholder="0"
                disabled={isPending}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="prixUnitaire"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="number"
                step="0.01"
                min="0"
                label="Prix unitaire HT (€)"
                placeholder="0.00"
                disabled={isPending}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="unite"
            control={form.control}
            render={({ field: { value, onChange, ...field } }) => (
              <Combobox
                {...field}
                label="Unité"
                required
                options={UNITE_OPTIONS}
                value={value}
                onValueChange={onChange}
                placeholder="Sélectionner..."
                disabled={isPending}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field: { value, onChange, ...field } }) => (
              <Combobox
                {...field}
                label="Catégorie"
                options={categoryOptions}
                value={value}
                onValueChange={onChange}
                placeholder="Aucune catégorie"
                clearable
                disabled={isPending}
              />
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <LoaderCircle className="size-4 animate-spin" />}
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
