import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TodoCategoryDTO } from '@/models'
import { cn } from '@/lib/utils'
import { useSaveTodoCategoryMutation } from '../api/useSaveTodoCategoryMutation'
import { DEFAULT_CATEGORY_COLOR } from '../lib/todos'
import { todoCategoryFormSchema, type TodoCategoryFormValues } from '../schemas/todoCategoryForm'

type TodoCategoryFormProps = {
  /** Catégorie en cours de modification ; `null` pour un ajout. */
  editingCategory: TodoCategoryDTO | null
  /** Une action sur les catégories est en cours (enregistrement ou suppression). */
  busy: boolean
  /** Enregistrement réussi : fin du mode édition. */
  onSaved: () => void
  onCancelEdit: () => void
}

const EMPTY_VALUES: TodoCategoryFormValues = { name: '', color: DEFAULT_CATEGORY_COLOR }

/** Formulaire en ligne d'ajout ou de modification d'une catégorie (nom + couleur). */
export function TodoCategoryForm({
  editingCategory,
  busy,
  onSaved,
  onCancelEdit,
}: TodoCategoryFormProps) {
  const saveMutation = useSaveTodoCategoryMutation()

  const form = useForm<TodoCategoryFormValues>({
    resolver: zodResolver(todoCategoryFormSchema),
    mode: 'onTouched',
    defaultValues: editingCategory
      ? {
          name: editingCategory.name || '',
          color: editingCategory.color || DEFAULT_CATEGORY_COLOR,
        }
      : EMPTY_VALUES,
  })
  // Abonnement dédié : suit la validité même si le React Compiler mémoïse le rendu
  const { isValid, errors } = useFormState({ control: form.control })

  const onSubmit = (values: TodoCategoryFormValues) => {
    saveMutation.mutate(
      { uuid: editingCategory?.uuid, data: { name: values.name.trim(), color: values.color } },
      {
        onSuccess: () => {
          toast.success('Succès', {
            description: editingCategory?.uuid ? 'Catégorie modifiée' : 'Catégorie créée',
          })
          form.reset(EMPTY_VALUES)
          onSaved()
        },
        onError: (error) =>
          toast.error('Erreur', {
            description:
              (error instanceof Error && error.message) || "Erreur lors de l'enregistrement",
          }),
      },
    )
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-lg border bg-muted/50 p-4"
    >
      <div className="flex items-end gap-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="todo-category-name"
                className={cn(fieldState.invalid && 'text-destructive')}
              >
                Nom de la catégorie
              </Label>
              <Input
                {...field}
                id="todo-category-name"
                placeholder="Ex: Urgent, En attente..."
                disabled={busy}
                required
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={fieldState.invalid ? 'todo-category-name-error' : undefined}
              />
            </div>
          )}
        />
        <Controller
          name="color"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="todo-category-color">Couleur</Label>
              <input
                {...field}
                id="todo-category-color"
                type="color"
                disabled={busy}
                className="h-9 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              />
            </div>
          )}
        />
        <div className="flex gap-2">
          {editingCategory && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onCancelEdit}
            >
              Annuler
            </Button>
          )}
          <Button type="submit" size="sm" disabled={busy || !isValid}>
            {saveMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
            {editingCategory ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </div>
      <FieldError id="todo-category-name-error" className="mt-2">
        {errors.name?.message}
      </FieldError>
    </form>
  )
}
