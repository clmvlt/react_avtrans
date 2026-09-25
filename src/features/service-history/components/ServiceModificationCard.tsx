import type { KeyboardEvent } from 'react'
import type { ServiceModificationDTO } from '@/models'
import { formatParisDateTime } from '@/utils/timeFormatters'
import { ModificationUser } from './ModificationUser'
import { ServiceModificationActionBadge } from './ServiceModificationActionBadge'
import { ServiceModificationSummary } from './ServiceModificationSummary'

type ServiceModificationCardProps = {
  modification: ServiceModificationDTO
  /** Ouvre l'historique du pointage (clic, Entrée ou Espace). */
  onOpen: (serviceUuid: string) => void
}

/** Carte mobile d'une entrée du journal des pointages. */
export function ServiceModificationCard({ modification, onOpen }: ServiceModificationCardProps) {
  const open = () => onOpen(modification.serviceUuid)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    open()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={open}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <ModificationUser user={modification.user} size="md" />
        <ServiceModificationActionBadge action={modification.action} />
      </div>
      <ServiceModificationSummary modification={modification} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          par
          <ModificationUser user={modification.modifiedBy} missingLabel="Administrateur supprimé" />
        </span>
        <span className="text-xs text-muted-foreground">
          {formatParisDateTime(modification.createdAt)}
        </span>
      </div>
    </div>
  )
}
