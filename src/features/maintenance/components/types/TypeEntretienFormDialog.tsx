import type { ComponentProps } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TypeEntretienForm } from './TypeEntretienForm'

type TypeEntretienFormDialogProps = Omit<ComponentProps<typeof TypeEntretienForm>, 'onClose'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog « Nouveau type d'entretien » / « Modifier le type d'entretien ». Le formulaire est monté
 * à chaque ouverture : il repart des valeurs du type, sans l'erreur précédente.
 */
export function TypeEntretienFormDialog({
  open,
  onOpenChange,
  ...formProps
}: TypeEntretienFormDialogProps) {
  const isEdit = !!formProps.type?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le type d'entretien" : "Nouveau type d'entretien"}
          </DialogTitle>
        </DialogHeader>
        <TypeEntretienForm {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
