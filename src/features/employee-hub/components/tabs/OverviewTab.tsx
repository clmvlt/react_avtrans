import type { AbsenceAction } from '@/features/absences/components/admin/absenceRowActions'
import type { AcompteAction } from '@/features/acomptes/components/admin/acompteRowActions'
import type { AbsenceDTO, AcompteDTO, UserDTO } from '@/models'
import type { usePendingRequests } from '../../hooks/usePendingRequests'
import { EmployeeInfoCard } from '../EmployeeInfoCard'
import { MonthCalendar } from '../MonthCalendar'
import { PendingRequestsCard } from '../PendingRequestsCard'

type OverviewTabProps = {
  user: UserDTO
  userName: string
  pending: ReturnType<typeof usePendingRequests>
  onSelectDay: (dateKey: string) => void
  onAbsenceAction: (action: AbsenceAction, absence: AbsenceDTO) => void
  onAcompteAction: (action: AcompteAction, acompte: AcompteDTO) => void
  onEditAccount: () => void
}

/**
 * Aperçu : le calendrier du mois prend la place disponible ; « À traiter » et les coordonnées
 * passent à droite sur très grand écran, dessous (côte à côte) sinon.
 */
export function OverviewTab({
  user,
  userName,
  pending,
  onSelectDay,
  onAbsenceAction,
  onAcompteAction,
  onEditAccount,
}: OverviewTabProps) {
  return (
    <div className="grid items-start gap-4 sm:gap-6 3xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
      <MonthCalendar userUuid={user.uuid ?? ''} userName={userName} onSelectDay={onSelectDay} />
      <div className="grid items-start gap-4 sm:gap-6 md:grid-cols-2 3xl:grid-cols-1">
        <PendingRequestsCard
          pending={pending}
          onAbsenceAction={onAbsenceAction}
          onAcompteAction={onAcompteAction}
        />
        <EmployeeInfoCard user={user} onEdit={onEditAccount} />
      </div>
    </div>
  )
}
