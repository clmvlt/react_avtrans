import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Gauge, LoaderCircle } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'
import { useAddKilometrageMutation } from '../../api/useAddKilometrageMutation'
import { getErrorMessage } from '../../lib/errors'
import {
  kilometrageFormSchema,
  toIsoDate,
  type KilometrageFormValues,
} from '../../schemas/kilometrage'
import { FormErrorBanner } from '../FormErrorBanner'
import { KilometrageFields } from '../forms/KilometrageFields'

type AddKmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  /** Relevé enregistré : l'historique km revient à la première page. */
  onAdded: () => void
}

/**
 * « Ajouter un kilométrage » (VehiculeDetail.vue:146). L'admin peut dater le relevé : il passe
 * alors par l'endpoint admin ; sinon, date courante. Le dialog se ferme une fois le véhicule et
 * l'historique rechargés.
 */
export function AddKmDialog({ open, onOpenChange, vehiculeId, onAdded }: AddKmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <AddKmForm vehiculeId={vehiculeId} onAdded={onAdded} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

type AddKmFormProps = {
  vehiculeId: string
  onAdded: () => void
  onClose: () => void
}

function AddKmForm({ vehiculeId, onAdded, onClose }: AddKmFormProps) {
  const isAdmin = useAuthStore(selectIsAdmin)
  const addKilometrage = useAddKilometrageMutation()
  const form = useForm<KilometrageFormValues>({
    resolver: zodResolver(kilometrageFormSchema),
    defaultValues: { km: '', date: '' },
    mode: 'onTouched',
  })
  const saving = addKilometrage.isPending

  const onSubmit = ({ km, date }: KilometrageFormValues) => {
    addKilometrage.mutate(
      { vehiculeId, km: Number(km), createdAt: isAdmin ? toIsoDate(date) : undefined },
      {
        onSuccess: () => {
          onAdded()
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Gauge className="size-5" />
          </div>
          Ajouter un kilométrage
        </DialogTitle>
        <DialogDescription className="sr-only">Formulaire d'ajout de kilométrage</DialogDescription>
      </DialogHeader>

      {addKilometrage.isError && (
        <FormErrorBanner>
          {getErrorMessage(addKilometrage.error, "Erreur lors de l'ajout du kilométrage")}
        </FormErrorBanner>
      )}

      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <KilometrageFields
            kmLabel="Kilométrage actuel *"
            dateLabel={isAdmin ? 'Date du relevé (optionnel)' : undefined}
            dateHint="Laissez vide pour utiliser la date actuelle"
            numericKeyboard
            autoFocus
            disabled={saving}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!form.formState.isValid || saving}>
              {saving ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Check className="mr-2 size-4" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </FormProvider>
    </>
  )
}
