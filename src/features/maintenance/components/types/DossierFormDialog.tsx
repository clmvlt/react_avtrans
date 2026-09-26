import type { ComponentProps } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DossierForm } from './DossierForm'

type DossierFormDialogProps = Omit<ComponentProps<typeof DossierForm>, 'onClose'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog « Nouveau dossier » / « Modifier le dossier ». Le formulaire est monté à chaque
 * ouverture : il repart des valeurs du dossier, sans l'erreur précédente.
 */
export function DossierFormDialog({ open, onOpenChange, ...formProps }: DossierFormDialogProps) {
  const isEdit = !!formProps.dossier?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le dossier' : 'Nouveau dossier'}</DialogTitle>
        </DialogHeader>
        <DossierForm {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
