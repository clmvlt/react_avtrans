import { History } from 'lucide-react'
import type { ServiceModificationDTO } from '@/models'
import { ServiceModificationCard } from './ServiceModificationCard'

type ServiceModificationListProps = {
  modifications: ServiceModificationDTO[]
  /** Texte de la liste vide (dépend des filtres saisis). */
  emptyText: string
  onOpen: (serviceUuid: string) => void
}

/** Journal en cartes, sous `md`. */
export function ServiceModificationList({
  modifications,
  emptyText,
  onOpen,
}: ServiceModificationListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {modifications.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <History className="size-10 opacity-50" />
          <p>{emptyText}</p>
        </div>
      )}
      {modifications.map((modification) => (
        <ServiceModificationCard
          key={modification.uuid}
          modification={modification}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
