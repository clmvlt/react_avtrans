import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'
import type { ServiceDTO } from '@/models'
import { formatDuration, formatTime } from '@/utils/timeFormatters'

type DeleteServiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ServiceDTO | null
  isPending: boolean
  onConfirm: () => void
}

const toText = (value: Date | string | undefined) => (value ? String(value) : null)

/**
 * Confirmation de suppression d'un service ou d'une pause. Titre repris tel quel du Vue
 * (« Supprimer ce pause ? » pour une pause).
 */
export function DeleteServiceDialog({
  open,
  onOpenChange,
  service,
  isPending,
  onConfirm,
}: DeleteServiceDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={null}
      title={`Supprimer ce ${service?.isBreak ? 'pause' : 'service'} ?`}
      description="Cette action est irréversible."
      confirmLabel="Supprimer"
      isPending={isPending}
      onConfirm={onConfirm}
    >
      {service && (
        <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
          <div
            className={cn(
              'h-6 w-1 shrink-0 rounded-full',
              service.isBreak ? 'bg-amber-500' : 'bg-green-500',
            )}
          />
          <span className="font-mono text-sm font-medium">
            {formatTime(toText(service.debut))} → {formatTime(toText(service.fin)) || '--:--'}
          </span>
          {!!service.duree && (
            <span className="font-mono text-sm text-muted-foreground">
              ({formatDuration(service.duree)})
            </span>
          )}
        </div>
      )}
    </ConfirmDialog>
  )
}
