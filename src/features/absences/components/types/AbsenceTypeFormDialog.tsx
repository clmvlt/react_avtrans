import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { AbsenceTypeDTO } from '@/models'
import { cn } from '@/lib/utils'
import { useSaveAbsenceTypeMutation } from '../../api/useSaveAbsenceTypeMutation'
import { errorMessage } from '../../lib/errorMessage'
import { absenceTypeSchema } from '../../schemas/absenceType'
import { FormErrorAlert } from '../FormErrorAlert'

type AbsenceTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Type à modifier ; `null` : création. */
  absenceType: AbsenceTypeDTO | null
}

const DEFAULT_COLOR = '#3B82F6'

/** Couleurs proposées sous le sélecteur. */
const COLOR_PRESETS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
]

/** Création ou modification d'un type d'absence (port d'`AbsenceTypeEditModal.vue`). */
export function AbsenceTypeFormDialog({
  open,
  onOpenChange,
  absenceType,
}: AbsenceTypeFormDialogProps) {
  const isEditing = !!absenceType?.uuid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le type' : "Nouveau type d'absence"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifier un type d'absence existant" : "Créer un nouveau type d'absence"}
          </DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : valeurs et erreurs repartent de zéro. */}
        <AbsenceTypeFormBody
          key={absenceType?.uuid ?? 'new'}
          absenceType={absenceType}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type AbsenceTypeFormBodyProps = {
  absenceType: AbsenceTypeDTO | null
  onClose: () => void
}

function AbsenceTypeFormBody({ absenceType, onClose }: AbsenceTypeFormBodyProps) {
  const id = useId()
  const isEditing = !!absenceType?.uuid
  const saveType = useSaveAbsenceTypeMutation()
  const saving = saveType.isPending

  const form = useForm({
    resolver: zodResolver(absenceTypeSchema),
    defaultValues: {
      name: absenceType?.name || '',
      color: absenceType?.color || DEFAULT_COLOR,
    },
  })

  const onSubmit = (values: { name: string; color: string }) =>
    saveType.mutate(
      { uuid: isEditing ? absenceType?.uuid : undefined, data: values },
      {
        onSuccess: () => {
          toast.success('Succès', {
            description: isEditing
              ? "Type d'absence modifié avec succès"
              : "Type d'absence créé avec succès",
          })
          onClose()
        },
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, "Erreur lors de l'enregistrement"),
          }),
      },
    )

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {saveType.isError && (
        <FormErrorAlert message={errorMessage(saveType.error, "Erreur lors de l'enregistrement")} />
      )}

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${id}-name`}>Nom du type *</FieldLabel>
            <Input
              {...field}
              id={`${id}-name`}
              type="text"
              placeholder="Ex: Congés payés, Maladie..."
              disabled={saving}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="color"
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={`${id}-color`}>Couleur *</FieldLabel>
              <div className="flex items-center gap-3">
                <input
                  id={`${id}-color`}
                  type="color"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  disabled={saving}
                  className="size-12 cursor-pointer rounded-md border-2 border-input bg-transparent p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-1"
                />
                <Input
                  {...field}
                  type="text"
                  aria-label="Code couleur"
                  placeholder="#000000"
                  disabled={saving}
                  aria-invalid={fieldState.invalid}
                  className="flex-1 font-mono"
                />
                <div
                  className="size-12 shrink-0 rounded-md border-2 border-border"
                  style={{ backgroundColor: field.value }}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Couleurs suggérées :</span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Couleur ${color}`}
                    aria-pressed={field.value === color}
                    disabled={saving}
                    onClick={() => field.onChange(color)}
                    className={cn(
                      'size-8 rounded-md border-2 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                      field.value === color
                        ? 'border-foreground shadow-[0_0_0_2px] shadow-background'
                        : 'border-transparent',
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          {isEditing ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  )
}
