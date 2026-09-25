import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { CouchetteDTO } from '@/models'
import { formatDayLong, formatDeclaredAt } from '../lib/couchetteDates'

type MyCouchetteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  couchette: CouchetteDTO | null
  isPending: boolean
  onConfirm: () => void
}

/** Confirmation « Supprimer la couchette » de /mycouchettes (seule celle du jour est supprimable). */
export function MyCouchetteDeleteDialog({
  open,
  onOpenChange,
  couchette,
  isPending,
  onConfirm,
}: MyCouchetteDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer la couchette"
      description="Cette action est irréversible."
      icon={null}
      cancelLabel="Retour"
      isPending={isPending}
      onConfirm={onConfirm}
    >
      {couchette && (
        <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium capitalize">{formatDayLong(couchette.date)}</span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Déclarée le</span>
            <span className="font-medium">{formatDeclaredAt(couchette.createdAt)}</span>
          </div>
        </div>
      )}
    </ConfirmDialog>
  )
}
