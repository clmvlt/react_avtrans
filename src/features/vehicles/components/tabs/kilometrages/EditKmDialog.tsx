import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Gauge, LoaderCircle, User } from 'lucide-react'
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
import type { VehiculeKilometrageDTO } from '@/models'
import { useUpdateKilometrageMutation } from '../../../api/useUpdateKilometrageMutation'
import { getErrorMessage } from '../../../lib/errors'
import { formatUserName, toDatetimeLocal } from '../../../lib/formatters'
import {
  kilometrageFormSchema,
  toIsoDate,
  type KilometrageFormValues,
} from '../../../schemas/kilometrage'
import { FormErrorBanner } from '../../FormErrorBanner'
import { KilometrageFields } from '../../forms/KilometrageFields'

type EditKmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kilometrage: VehiculeKilometrageDTO | null
  /** Relevé modifié : l'historique km revient à la première page. */
  onSaved: () => void
}

/** « Modifier le kilométrage » (admin, VehiculeDetail.vue:183) : valeur, date et auteur du relevé. */
export function EditKmDialog({ open, onOpenChange, kilometrage, onSaved }: EditKmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        {kilometrage && (
          <EditKmForm
            kilometrage={kilometrage}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type EditKmFormProps = {
  kilometrage: VehiculeKilometrageDTO
  onSaved: () => void
  onClose: () => void
}

function EditKmForm({ kilometrage, onSaved, onClose }: EditKmFormProps) {
  const updateKilometrage = useUpdateKilometrageMutation()
  const form = useForm<KilometrageFormValues>({
    resolver: zodResolver(kilometrageFormSchema),
    defaultValues: {
      km: kilometrage.km != null ? String(kilometrage.km) : '',
      date: toDatetimeLocal(kilometrage.createdAt),
    },
    mode: 'onTouched',
  })
  const saving = updateKilometrage.isPending
  const { user } = kilometrage

  const onSubmit = ({ km, date }: KilometrageFormValues) => {
    if (!kilometrage.id) return
    updateKilometrage.mutate(
      { kilometrageId: kilometrage.id, km: Number(km), createdAt: toIsoDate(date) },
      {
        onSuccess: () => {
          onSaved()
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
          Modifier le kilométrage
        </DialogTitle>
        <DialogDescription className="sr-only">
          Formulaire d'édition de kilométrage
        </DialogDescription>
      </DialogHeader>

      {updateKilometrage.isError && (
        <FormErrorBanner>
          {getErrorMessage(
            updateKilometrage.error,
            'Erreur lors de la modification du kilométrage',
          )}
        </FormErrorBanner>
      )}

      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <KilometrageFields kmLabel="Kilométrage *" dateLabel="Date du relevé" disabled={saving} />

          {user && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Enregistré par</p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2">
                {user.pictureUrl ? (
                  <div className="size-8 overflow-hidden rounded-full">
                    <img
                      src={user.pictureUrl}
                      alt={user.firstName}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                )}
                <span className="text-sm">{formatUserName(user)}</span>
              </div>
            </div>
          )}

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
