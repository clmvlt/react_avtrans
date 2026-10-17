import { TriangleAlert } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { liveLineSeconds } from '@/lib/liveCounter'
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
 * (« Supprimer ce pause ? » pour une pause). Supprimer un service supprime aussi ses pauses (D12) :
 * le dialog le dit et les compte.
 */
export function DeleteServiceDialog({
  open,
  onOpenChange,
  service,
  isPending,
  onConfirm,
}: DeleteServiceDialogProps) {
  const pauseCount = service && !service.isBreak ? (service.pauses?.length ?? 0) : 0
  const seconds = service ? liveLineSeconds(service, 0) : 0

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
        <div className="space-y-2">
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
            {seconds > 0 && (
              <span className="font-mono text-sm text-muted-foreground">
                ({formatDuration(seconds)})
              </span>
            )}
          </div>
          {pauseCount > 0 && (
            <p className="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {pauseCount === 1
                ? 'Sa pause sera aussi supprimée.'
                : `Ses ${pauseCount} pauses seront aussi supprimées.`}
            </p>
          )}
        </div>
      )}
    </ConfirmDialog>
  )
}
