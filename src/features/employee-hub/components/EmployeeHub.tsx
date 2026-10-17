import { UserX } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import type { AbsenceDialogType } from '@/features/absences/components/admin/AbsenceDialogs'
import type { AbsenceAction } from '@/features/absences/components/admin/absenceRowActions'
import type { AcompteDialogType } from '@/features/acomptes/components/admin/AcompteDialogs'
import type { AcompteAction } from '@/features/acomptes/components/admin/acompteRowActions'
import { useServiceHistory } from '@/features/service-history/hooks/useServiceHistory'
import type { ServiceRowHandlers } from '@/features/user-services/components/ServiceRowActions'
import { useUserServicesList } from '@/features/user-services/hooks/useUserServicesList'
import type { AbsenceDTO, AcompteDTO } from '@/models'
import { useEmployeeDirectory } from '../hooks/useEmployeeDirectory'
import { useHubDialogs } from '../hooks/useHubDialogs'
import { usePendingRequests } from '../hooks/usePendingRequests'
import { parseHubTab, visibleHubTabs, type HubTab } from '../lib/hubTabs'
import { EmployeeAccountMenu } from './EmployeeAccountMenu'
import { EmployeeAddMenu } from './EmployeeAddMenu'
import { EmployeeHubDialogs } from './EmployeeHubDialogs'
import { EmployeeHubTabList } from './EmployeeHubTabList'
import { EmployeePicker } from './EmployeePicker'
import { HoursCard } from './HoursCard'
import { TodayCard } from './TodayCard'
import { AbsencesTab } from './tabs/AbsencesTab'
import { AcomptesTab } from './tabs/AcomptesTab'
import { CouchettesTab } from './tabs/CouchettesTab'
import { HoursTab } from './tabs/HoursTab'
import { OverviewTab } from './tabs/OverviewTab'
import { ServicesTab } from './tabs/ServicesTab'
import { SignaturesTab } from './tabs/SignaturesTab'

const ABSENCE_DIALOG: Record<AbsenceAction, AbsenceDialogType> = {
  approve: 'approve',
  reject: 'reject',
  details: 'detail',
  edit: 'edit',
  hours: 'hours',
  delete: 'delete',
}

const ACOMPTE_DIALOG: Record<Exclude<AcompteAction, 'togglePayment'>, AcompteDialogType> = {
  approve: 'approve',
  reject: 'reject',
  details: 'detail',
  delete: 'delete',
}

type EmployeeHubProps = {
  userUuid: string
  /** Onglet lu dans l'URL */
  rawTab: string | null
  onTabChange: (tab: HubTab) => void
  onSelectUser: (userUuid: string) => void
  /** Retour à la liste des employés (compte supprimé ou introuvable) */
  onClear: () => void
}

/**
 * Fiche d'un employé : sélecteur et actions en tête, journée et heures dans la colonne de gauche,
 * onglets à droite (aperçu, pointages, absences, acomptes, heures, signatures, couchettes).
 * Remontée à chaque changement d'employé (clé), donc tout repart de zéro sauf l'onglet.
 */
export function EmployeeHub({
  userUuid,
  rawTab,
  onTabChange,
  onSelectUser,
  onClear,
}: EmployeeHubProps) {
  const { usersQuery, entries } = useEmployeeDirectory(userUuid)
  const dialogs = useHubDialogs()
  const list = useUserServicesList(userUuid)
  const pending = usePendingRequests(userUuid)
  const { open: openHistory } = useServiceHistory()

  const entry = entries.find((item) => item.user.uuid === userUuid) ?? null
  const user = entry?.user ?? null
  const picker = (
    <EmployeePicker
      entries={entries}
      selected={entry}
      onSelect={onSelectUser}
      disabled={usersQuery.isPending}
      className="w-full sm:w-auto"
    />
  )

  if (usersQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <span className="sr-only">Chargement de la fiche...</span>
        <Skeleton className="h-16 w-full rounded-xl sm:w-80" />
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        message={usersQuery.error.message || 'Erreur lors du chargement des employés'}
        onRetry={() => void usersQuery.refetch()}
        isRetrying={usersQuery.isFetching}
      />
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        {picker}
        <Empty className="rounded-xl border py-16">
          <EmptyMedia>
            <UserX className="size-10 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyTitle>Employé introuvable</EmptyTitle>
          <EmptyDescription>Ce compte n&apos;existe plus ou a été supprimé.</EmptyDescription>
          <EmptyContent>
            <Button variant="outline" onClick={onClear}>
              Voir tous les employés
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const isCouchette = user.isCouchette === true
  const tab = parseHubTab(rawTab, isCouchette)
  const userName = entry?.fullName ?? ''

  const serviceHandlers: ServiceRowHandlers = {
    onLocation: dialogs.services.openLocation,
    onHistory: openHistory,
    onEdit: dialogs.services.openEdit,
    onDelete: dialogs.services.openDelete,
  }
  const onAbsenceAction = (action: AbsenceAction, absence: AbsenceDTO) =>
    dialogs.absences.open(ABSENCE_DIALOG[action], absence)
  const onAcompteAction = (action: AcompteAction, acompte: AcompteDTO) => {
    if (action !== 'togglePayment') dialogs.acomptes.open(ACOMPTE_DIALOG[action], acompte)
  }
  const showDay = (dateKey: string) => {
    list.show({ startDate: dateKey, endDate: dateKey, type: 'all' })
    onTabChange('pointages')
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {picker}
        <div className="ml-auto flex items-center gap-2">
          <EmployeeAddMenu
            canAddCouchette={isCouchette}
            onAddService={() => dialogs.services.openCreate()}
            onAddAbsence={() => dialogs.absences.open('create')}
            onAddAcompte={() => dialogs.acomptes.open('create')}
            onAddCouchette={() => dialogs.couchettes.open('create')}
          />
          <EmployeeAccountMenu
            onEdit={() => dialogs.account.open('edit', user)}
            onEditEmail={() => dialogs.account.open('email', user)}
            onDelete={() => dialogs.account.open('delete', user)}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] 3xl:grid-cols-[400px_minmax(0,1fr)]">
        <aside
          aria-label="Journée et heures de l'employé"
          className="grid min-w-0 items-start gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-1"
        >
          <TodayCard
            userUuid={userUuid}
            onShowServices={() => onTabChange('pointages')}
            onActionDone={() => list.goToPage(0)}
          />
          <HoursCard userUuid={userUuid} onShowHours={() => onTabChange('heures')} />
        </aside>

        <Tabs
          value={tab}
          onValueChange={(value) => onTabChange(value as HubTab)}
          className="min-w-0 gap-4"
        >
          <EmployeeHubTabList
            tabs={visibleHubTabs(isCouchette)}
            counts={{ absences: pending.absenceCount, acomptes: pending.acompteCount }}
          />
          <TabsContent value="apercu">
            <OverviewTab
              user={user}
              userName={userName}
              pending={pending}
              onSelectDay={showDay}
              onAbsenceAction={onAbsenceAction}
              onAcompteAction={onAcompteAction}
              onEditAccount={() => dialogs.account.open('edit', user)}
            />
          </TabsContent>
          <TabsContent value="pointages">
            <ServicesTab
              list={list}
              handlers={serviceHandlers}
              onAdd={dialogs.services.openCreate}
            />
          </TabsContent>
          <TabsContent value="absences">
            <AbsencesTab
              userUuid={userUuid}
              onAction={onAbsenceAction}
              onCreate={() => dialogs.absences.open('create')}
            />
          </TabsContent>
          <TabsContent value="acomptes">
            <AcomptesTab
              userUuid={userUuid}
              onAction={onAcompteAction}
              onCreate={() => dialogs.acomptes.open('create')}
            />
          </TabsContent>
          <TabsContent value="heures">
            <HoursTab userUuid={userUuid} />
          </TabsContent>
          <TabsContent value="signatures">
            <SignaturesTab userUuid={userUuid} />
          </TabsContent>
          {isCouchette && (
            <TabsContent value="couchettes">
              <CouchettesTab
                userUuid={userUuid}
                onCreate={() => dialogs.couchettes.open('create')}
                onDelete={(couchette) => dialogs.couchettes.open('delete', couchette)}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <EmployeeHubDialogs
        userUuid={userUuid}
        dialogs={dialogs}
        onServicesChanged={() => list.goToPage(0)}
        onUserDeleted={onClear}
      />
    </div>
  )
}
