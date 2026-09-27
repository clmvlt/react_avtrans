import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { AbsentSection } from '@/features/monitoring/components/AbsentSection'
import { MonitoringSkeleton } from '@/features/monitoring/components/MonitoringSkeleton'
import { PresenceSection } from '@/features/monitoring/components/PresenceSection'
import { PresenceStatsPills } from '@/features/monitoring/components/PresenceStatsPills'
import { useMonitoringActions } from '@/features/monitoring/hooks/useMonitoringActions'
import { useMonitoringUsers } from '@/features/monitoring/hooks/useMonitoringUsers'
import { filterPresenceGroups, groupByPresence } from '@/features/monitoring/lib/groupByPresence'
import { UserHoursDialog } from '@/features/users/components/UserHoursDialog'
import { useDialogState } from '@/hooks/useDialogState'
import type { UserWithStatusDTO } from '@/models'

/**
 * `/services` (admin) : suivi des présences, rafraîchi toutes les 10 s (ServicesMonitoring.vue).
 * « Réessayer » remonte le contenu pour rejouer le premier chargement (erreur figée, B-16).
 */
export default function ServicesMonitoringPage() {
  const [attempt, setAttempt] = useState(0)
  return (
    <ServicesMonitoringContent key={attempt} onRetry={() => setAttempt((count) => count + 1)} />
  )
}

type ServicesMonitoringContentProps = {
  onRetry: () => void
}

function ServicesMonitoringContent({ onRetry }: ServicesMonitoringContentProps) {
  const { users, isLoading, error } = useMonitoringUsers()
  const [search, setSearch] = useState('')
  const [showAbsent, setShowAbsent] = useState(false)
  const hoursDialog = useDialogState<'hours', UserWithStatusDTO>()
  const actions = useMonitoringActions((user) => hoursDialog.open('hours', user))

  const groups = groupByPresence(users)
  const filtered = filterPresenceGroups(groups, search)
  const isEmpty =
    filtered.present.length === 0 && filtered.onBreak.length === 0 && filtered.absent.length === 0

  return (
    <PageContainer>
      <PageHeader
        title="Présences"
        description="Qui est en service, en pause ou absent en ce moment (mis à jour toutes les 10 secondes)."
      >
        {/* Compteurs de toute l'équipe (sans la recherche), mis à jour même après une erreur (B-16) */}
        {!isLoading && (
          <PresenceStatsPills
            present={groups.present.length}
            onBreak={groups.onBreak.length}
            absent={groups.absent.length}
          />
        )}
      </PageHeader>

      {isLoading ? (
        <MonitoringSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un employé..."
              aria-label="Rechercher un employé"
              className="pl-9"
            />
          </div>

          <PresenceSection
            title="Présents"
            dotClass="bg-green-500"
            users={filtered.present}
            color="green"
            actions={actions}
          />
          <PresenceSection
            title="En pause"
            dotClass="bg-amber-500"
            users={filtered.onBreak}
            color="amber"
            actions={actions}
          />
          <AbsentSection
            users={filtered.absent}
            open={showAbsent}
            onOpenChange={setShowAbsent}
            actions={actions}
          />

          {isEmpty && (
            <Empty className="gap-3 rounded-xl border px-4 py-16 text-muted-foreground md:px-4 md:py-16">
              <Users className="size-10 opacity-50" />
              <p>Aucun employé trouvé</p>
              {search && (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Effacer la recherche
                </Button>
              )}
            </Empty>
          )}
        </div>
      )}

      <UserHoursDialog
        open={hoursDialog.isOpen('hours')}
        onOpenChange={hoursDialog.onOpenChange}
        user={hoursDialog.item}
      />
    </PageContainer>
  )
}
