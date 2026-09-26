import type { ComponentProps } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfigEntretienForm } from './ConfigEntretienForm'

type ConfigEntretienDialogProps = Omit<ComponentProps<typeof ConfigEntretienForm>, 'onClose'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Change à chaque ouverture : le formulaire repart de la configuration (ou des défauts). */
  formKey: number
}

/** Dialog « Nouvelle configuration » / « Modifier la configuration » (ConfigEntretienModal.vue). */
export function ConfigEntretienDialog({
  open,
  onOpenChange,
  formKey,
  ...formProps
}: ConfigEntretienDialogProps) {
  const isEdit = formProps.config !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier la configuration' : 'Nouvelle configuration'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifier les paramètres de cette configuration d'entretien"
              : "Ajouter une nouvelle configuration d'entretien pour ce véhicule"}
          </DialogDescription>
        </DialogHeader>
        <ConfigEntretienForm key={formKey} {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
