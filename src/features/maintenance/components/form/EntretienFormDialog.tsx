import type { ComponentProps } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FleetEntretienForm } from './FleetEntretienForm'

type EntretienFormDialogProps = Omit<ComponentProps<typeof FleetEntretienForm>, 'onClose'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Change à chaque ouverture : le formulaire est remonté avec `defaultValues`. */
  formKey: number
}

/** Dialog « Nouvel entretien » / « Modifier l'entretien » d'Entretiens.vue. */
export function EntretienFormDialog({
  open,
  onOpenChange,
  formKey,
  ...formProps
}: EntretienFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {formProps.entretien ? "Modifier l'entretien" : 'Nouvel entretien'}
          </DialogTitle>
        </DialogHeader>
        <FleetEntretienForm key={formKey} {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
