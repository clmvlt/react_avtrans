import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { TodoCategoryDTO, TodoDTO } from '@/models'
import { useSaveTodoMutation } from '../api/useSaveTodoMutation'
import { todoFormSchema, type TodoFormValues } from '../schemas/todoForm'

type TodoFormProps = {
  isCreating: boolean
  todoUuid?: string
  /** Tâche chargée en édition (valeurs initiales). */
  todo: TodoDTO | null
  /** Erreur de chargement de la tâche, affichée en haut du formulaire (vide sinon). */
  loadError: string
  categories: TodoCategoryDTO[]
  onCancel: () => void
  onSaved: () => void
  /** Lien « Créer une catégorie » (affiché s'il n'existe aucune catégorie). */
  onOpenCategories: () => void
}

/**
 * Champs du formulaire de tâche. En modification, une description ou une catégorie vidée est
 * omise et l'API la laisse inchangée, alors que le sélecteur permet de l'effacer
 * (MIGRATION.md 8.3, reproduit).
 */
export function TodoForm({
  isCreating,
  todoUuid,
  todo,
  loadError,
  categories,
  onCancel,
  onSaved,
  onOpenCategories,
}: TodoFormProps) {
  const saveMutation = useSaveTodoMutation()
  const isPending = saveMutation.isPending

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
      categoryUuid: todo?.category?.uuid || '',
    },
  })
  // Abonnement dédié : suit la validité même si le React Compiler mémoïse le rendu
  const { isValid } = useFormState({ control: form.control })

  const categoryOptions = categories.map((category) => ({
    value: category.uuid || '',
    label: category.name || '',
  }))

  const onSubmit = (values: TodoFormValues) => {
    if (!isCreating && !todoUuid) {
      onSaved()
      return
    }
    const data = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      categoryUuid: values.categoryUuid || undefined,
    }
    saveMutation.mutate(
      { uuid: isCreating ? undefined : todoUuid, data },
      {
        onSuccess: () => {
          toast.success('Succès', { description: isCreating ? 'Tâche créée' : 'Tâche modifiée' })
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

  const errorMessage = saveMutation.isIdle
    ? loadError
    : saveMutation.isError
      ? (saveMutation.error instanceof Error && saveMutation.error.message) ||
        "Erreur lors de l'enregistrement"
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
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <InputField
            {...field}
            label="Titre"
            required
            placeholder="Titre de la tâche"
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
            <FieldLabel htmlFor="todo-description">Description</FieldLabel>
            <Textarea
              {...field}
              id="todo-description"
              placeholder="Description détaillée (optionnel)"
              disabled={isPending}
              className="min-h-20"
            />
          </Field>
        )}
      />

      <div className="space-y-2">
        <Controller
          name="categoryUuid"
          control={form.control}
          render={({ field: { value, onChange, ...field } }) => (
            <Combobox
              {...field}
              label="Catégorie"
              options={categoryOptions}
              value={value}
              onValueChange={onChange}
              placeholder="Sans catégorie"
              searchable={false}
              clearable
              disabled={isPending}
            />
          )}
        />
        {categories.length === 0 && (
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={onOpenCategories}
          >
            Créer une catégorie
          </button>
        )}
      </div>

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
