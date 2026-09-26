import type { ComponentProps } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VehiculeEntretienForm } from './VehiculeEntretienForm'

type VehiculeEntretienFormDialogProps = Omit<
  ComponentProps<typeof VehiculeEntretienForm>,
  'onClose'
> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Change à chaque ouverture : le formulaire repart des valeurs de l'entretien. */
  formKey: number
}

/** Dialog « Nouvel entretien » / « Modifier l'entretien » d'EntretiensVehicule.vue. */
export function VehiculeEntretienFormDialog({
  open,
  onOpenChange,
  formKey,
  ...formProps
}: VehiculeEntretienFormDialogProps) {
  const isEdit = formProps.entretien !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'entretien" : 'Nouvel entretien'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations de l'entretien."
              : 'Renseignez les informations du nouvel entretien.'}
          </DialogDescription>
        </DialogHeader>
        <VehiculeEntretienForm key={formKey} {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
