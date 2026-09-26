import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { StockCategoryDTO } from '@/models'
import { useSaveStockCategoryMutation } from '../api/useSaveStockCategoryMutation'
import { stockCategorySchema, type StockCategoryFormValues } from '../schemas/stockCategory'

type StockCategoryFormProps = {
  /** Catégorie modifiée ; `null` en création. */
  category: StockCategoryDTO | null
  onCancel: () => void
  onSaved: () => void
}

/** Formulaire de catégorie de stock ; les valeurs sont envoyées telles quelles, comme le Vue. */
export function StockCategoryForm({ category, onCancel, onSaved }: StockCategoryFormProps) {
  const saveMutation = useSaveStockCategoryMutation()
  const isPending = saveMutation.isPending

  const form = useForm<StockCategoryFormValues>({
    resolver: zodResolver(stockCategorySchema),
    defaultValues: { nom: category?.nom || '', description: category?.description || '' },
  })

  const onSubmit = (values: StockCategoryFormValues) => {
    saveMutation.mutate(
      { id: category?.id, data: values },
      {
        onSuccess: () => {
          toast.success('Succès', {
            description: category
              ? 'Catégorie modifiée avec succès !'
              : 'Catégorie créée avec succès !',
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
        <Controller
          name="nom"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              label="Nom"
              required
              placeholder="Freins"
              disabled={isPending}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="stock-category-description">Description</FieldLabel>
              <Textarea
                {...field}
                id="stock-category-description"
                rows={2}
                placeholder="Pièces liées au système de freinage"
                disabled={isPending}
                className="min-h-[60px] resize-y"
              />
            </Field>
          )}
        />

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
