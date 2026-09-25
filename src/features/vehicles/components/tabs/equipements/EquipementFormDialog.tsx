import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, Wrench } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { VehiculeEquipementDTO } from '@/models'
import { useSaveEquipementMutation } from '../../../api/useSaveEquipementMutation'
import { getErrorMessage } from '../../../lib/errors'
import {
  equipementFormSchema,
  equipementToFormValues,
  toQuantite,
  type EquipementFormValues,
} from '../../../schemas/equipement'
import { FormErrorBanner } from '../../FormErrorBanner'

type EquipementFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  /** Équipement modifié ; `null` = création. */
  equipement: VehiculeEquipementDTO | null
}

/** Ajout ou modification d'un équipement (VehiculeEquipementModal.vue). Pas de toast, comme le Vue. */
export function EquipementFormDialog({
  open,
  onOpenChange,
  vehiculeId,
  equipement,
}: EquipementFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <EquipementForm
          vehiculeId={vehiculeId}
          equipement={equipement}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type EquipementFormProps = {
  vehiculeId: string
  equipement: VehiculeEquipementDTO | null
  onClose: () => void
}

function EquipementForm({ vehiculeId, equipement, onClose }: EquipementFormProps) {
  const nomId = useId()
  const quantiteId = useId()
  const commentaireId = useId()
  const saveEquipement = useSaveEquipementMutation(vehiculeId)
  const form = useForm<EquipementFormValues>({
    resolver: zodResolver(equipementFormSchema),
    defaultValues: equipementToFormValues(equipement),
    mode: 'onTouched',
  })
  const isEditMode = !!equipement
  const saving = saveEquipement.isPending

  const onSubmit = ({ nom, quantite, commentaire }: EquipementFormValues) => {
    saveEquipement.mutate(
      {
        equipementId: equipement?.id,
        nom,
        quantite: toQuantite(quantite),
        // Commentaire vidé = omis : impossible de l'effacer si l'API fusionne (MIGRATION.md 8.3)
        commentaire: commentaire || undefined,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wrench className="size-5" />
          </div>
          {isEditMode ? "Modifier l'équipement" : 'Ajouter un équipement'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isEditMode
            ? "Formulaire de modification d'équipement"
            : "Formulaire d'ajout d'équipement"}
        </DialogDescription>
      </DialogHeader>

      {saveEquipement.isError && (
        <FormErrorBanner>
          {getErrorMessage(saveEquipement.error, 'Erreur lors de la sauvegarde')}
        </FormErrorBanner>
      )}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="nom"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
              <FieldLabel
                htmlFor={nomId}
                className={cn('text-sm font-medium', fieldState.invalid && 'text-destructive')}
              >
                Nom *
              </FieldLabel>
              <Input
                {...field}
                id={nomId}
                placeholder="Ex: Gilet jaune, Triangle, Extincteur..."
                disabled={saving}
                aria-invalid={fieldState.invalid || undefined}
              />
              <FieldError className="text-xs">{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="quantite"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
              <FieldLabel
                htmlFor={quantiteId}
                className={cn('text-sm font-medium', fieldState.invalid && 'text-destructive')}
              >
                Quantité
              </FieldLabel>
              <Input
                {...field}
                id={quantiteId}
                type="number"
                min={1}
                placeholder="1"
                disabled={saving}
                aria-invalid={fieldState.invalid || undefined}
              />
              <FieldError className="text-xs">{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="commentaire"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={commentaireId} className="text-sm font-medium">
                Commentaire
              </FieldLabel>
              <Textarea
                {...field}
                id={commentaireId}
                rows={3}
                placeholder="Commentaire optionnel..."
                disabled={saving}
                className="field-sizing-fixed bg-background dark:bg-background"
              />
            </Field>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || saving}>
            {saving ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="mr-2 size-4" />
            )}
            {isEditMode ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
