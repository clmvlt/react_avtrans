import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CouchetteDTO } from '@/models'
import { CouchetteUserSummary } from './CouchetteUserSummary'

type CouchetteDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  couchette: CouchetteDTO | null
  /** « Supprimer » : la page ferme ce dialog et ouvre la confirmation. */
  onDelete: (couchette: CouchetteDTO) => void
}

/** Détails d'une couchette (lecture seule). */
export function CouchetteDetailDialog({
  open,
  onOpenChange,
  couchette,
  onDelete,
}: CouchetteDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de la couchette</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées de la couchette
          </DialogDescription>
        </DialogHeader>

        {couchette && (
          <div className="space-y-5">
            <CouchetteUserSummary couchette={couchette} />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!couchette}
            onClick={() => couchette && onDelete(couchette)}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
