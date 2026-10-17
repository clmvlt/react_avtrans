import type { ReactNode } from 'react'
import { CalendarX2, Check, CircleCheck, Coins, Inbox, X } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AbsenceAction } from '@/features/absences/components/admin/absenceRowActions'
import { formatDateShort } from '@/features/absences/lib/dateFormat'
import type { AcompteAction } from '@/features/acomptes/components/admin/acompteRowActions'
import { formatMontantAdmin } from '@/features/acomptes/lib/formatMontantAdmin'
import { getAbsenceColor, getAbsenceTypeName } from '@/features/planning/lib/absenceCellStyle'
import type { AbsenceDTO, AcompteDTO } from '@/models'
import { calculateAbsenceDuration } from '@/utils/absenceFormatters'
import type { usePendingRequests } from '../hooks/usePendingRequests'
import { HubCard } from './HubCard'

type PendingRequestsCardProps = {
  pending: ReturnType<typeof usePendingRequests>
  onAbsenceAction: (action: AbsenceAction, absence: AbsenceDTO) => void
  onAcompteAction: (action: AcompteAction, acompte: AcompteDTO) => void
}

type RequestRowProps = {
  icon: ReactNode
  title: ReactNode
  subtitle: ReactNode
  onOpen: () => void
  onApprove: () => void
  onReject: () => void
}

/** Une demande : ouverture du détail au clic, boutons Refuser / Approuver. */
function RequestRow({ icon, title, subtitle, onOpen, onApprove, onReject }: RequestRowProps) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3 @md:flex-row @md:items-center">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {icon}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        </span>
      </button>
      <div className="flex shrink-0 justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onReject}>
          <X className="size-4" />
          Refuser
        </Button>
        <Button variant="outline" size="sm" className="text-success" onClick={onApprove}>
          <Check className="size-4" />
          Approuver
        </Button>
      </div>
    </li>
  )
}

/**
 * « À traiter » : absences et acomptes de l'employé qui attendent une réponse, à approuver ou
 * refuser sans quitter la fiche (mêmes dialogs que les pages Absences et Acomptes).
 */
export function PendingRequestsCard({
  pending,
  onAbsenceAction,
  onAcompteAction,
}: PendingRequestsCardProps) {
  const { absencesQuery, acomptesQuery, absences, acomptes } = pending
  const total = pending.absenceCount + pending.acompteCount
  const isLoading = absencesQuery.isPending || acomptesQuery.isPending
  const error = absencesQuery.error ?? acomptesQuery.error

  return (
    <HubCard
      title="À traiter"
      icon={Inbox}
      description={
        total > 0
          ? `${total} demande${total > 1 ? 's' : ''} en attente de réponse`
          : 'Demandes en attente de réponse'
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            void absencesQuery.refetch()
            void acomptesQuery.refetch()
          }}
          isRetrying={absencesQuery.isFetching || acomptesQuery.isFetching}
        />
      ) : total === 0 ? (
        <div className="flex items-center gap-3 rounded-lg bg-success/5 p-3 text-sm text-muted-foreground">
          <CircleCheck className="size-5 shrink-0 text-success" />
          Rien à traiter : aucune demande en attente.
        </div>
      ) : (
        <ul className="@container flex flex-col gap-2">
          {absences.map((absence) => (
            <RequestRow
              key={absence.uuid}
              icon={
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${getAbsenceColor(absence)}26`,
                    color: getAbsenceColor(absence),
                  }}
                >
                  <CalendarX2 className="size-4" />
                </span>
              }
              title={getAbsenceTypeName(absence)}
              subtitle={`${formatDateShort(absence.startDate)}${
                absence.endDate && absence.endDate !== absence.startDate
                  ? ` → ${formatDateShort(absence.endDate)}`
                  : ''
              } · ${calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}`}
              onOpen={() => onAbsenceAction('details', absence)}
              onApprove={() => onAbsenceAction('approve', absence)}
              onReject={() => onAbsenceAction('reject', absence)}
            />
          ))}
          {acomptes.map((acompte) => (
            <RequestRow
              key={acompte.uuid}
              icon={
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Coins className="size-4" />
                </span>
              }
              title={`Acompte de ${formatMontantAdmin(acompte.montant)}`}
              subtitle={acompte.raison || `Demandé le ${formatDateShort(acompte.createdAt)}`}
              onOpen={() => onAcompteAction('details', acompte)}
              onApprove={() => onAcompteAction('approve', acompte)}
              onReject={() => onAcompteAction('reject', acompte)}
            />
          ))}
        </ul>
      )}
    </HubCard>
  )
}
