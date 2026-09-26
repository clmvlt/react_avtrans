import { ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'
import { PresenceGrid } from './PresenceGrid'

type AbsentSectionProps = {
  users: UserWithStatusDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: MonitoringActions
}

/**
 * Section « Absents », repliée par défaut. Comme le Vue, les résultats d'une recherche y restent
 * cachés tant qu'elle est repliée.
 */
export function AbsentSection({ users, open, onOpenChange, actions }: AbsentSectionProps) {
  if (users.length === 0) return null

  return (
    <Collapsible asChild open={open} onOpenChange={onOpenChange}>
      <section>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="-mx-2 mb-3 flex w-[calc(100%+1rem)] items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
          >
            <h2 className="flex items-center gap-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              <span className="size-2 rounded-full bg-muted-foreground" />
              Absents ({users.length})
            </h2>
            <ChevronRight
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                open && 'rotate-90',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:duration-200 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
          <PresenceGrid users={users} color="gray" actions={actions} />
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
