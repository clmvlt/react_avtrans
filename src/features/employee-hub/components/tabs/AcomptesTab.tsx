import { useState } from 'react'
import { Coins, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { StatusChips } from '@/components/shared/StatusChips'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useAdminAcomptesQuery } from '@/features/acomptes/api/useAdminAcomptesQuery'
import { useToggleAcomptePaidMutation } from '@/features/acomptes/api/useToggleAcomptePaidMutation'
import type { AcompteAction } from '@/features/acomptes/components/admin/acompteRowActions'
import type { AcompteDTO } from '@/models'
import { ACOMPTE_STATUS_CHIPS, employeeAcompteParams } from '../../lib/requestParams'
import { AcompteItem } from './AcompteItem'
import { ListState } from './ListState'

type AcomptesTabProps = {
  userUuid: string
  /** Détail, approbation, refus, suppression : dialogs de la fiche */
  onAction: (action: Exclude<AcompteAction, 'togglePayment'>, acompte: AcompteDTO) => void
  onCreate: () => void
}

/**
 * Tous les acomptes de l'employé (tout l'historique), filtrables par statut. La bascule
 * « payé » est optimiste, comme sur la page Acomptes ; un échec revient en arrière avec un toast.
 */
export function AcomptesTab({ userUuid, onAction, onCreate }: AcomptesTabProps) {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const params = employeeAcompteParams(userUuid, status, page)
  const query = useAdminAcomptesQuery(params)
  const togglePaid = useToggleAcomptePaidMutation(params)
  const acomptes = query.data?.acomptes ?? []
  const totalElements = query.data?.totalElements ?? 0

  const handleAction = (action: AcompteAction, acompte: AcompteDTO) => {
    if (action !== 'togglePayment') {
      onAction(action, acompte)
      return
    }
    if (!acompte.uuid) return
    togglePaid.mutate(
      { uuid: acompte.uuid, isPaid: !acompte.isPaid },
      {
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, 'Erreur lors de la mise à jour du statut de paiement'),
          }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusChips
          options={ACOMPTE_STATUS_CHIPS}
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(0)
          }}
          className="flex-none"
        />
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          Nouvel acompte
        </Button>
      </div>

      <ListState
        isPending={query.isPending}
        error={query.error}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
        isEmpty={acomptes.length === 0}
        emptyIcon={Coins}
        emptyTitle="Aucun acompte"
        emptyDescription={
          status ? 'Aucun acompte avec ce statut.' : "Cet employé n'a encore demandé aucun acompte."
        }
        emptyAction={
          <Button variant="outline" onClick={onCreate}>
            <Plus className="size-4" />
            Nouvel acompte
          </Button>
        }
        loadingLabel="Chargement des acomptes..."
      >
        <p className="text-sm text-muted-foreground">
          {totalElements} acompte{totalElements > 1 ? 's' : ''}
        </p>
        <ul className="grid items-start gap-3 3xl:grid-cols-2">
          {acomptes.map((acompte) => (
            <AcompteItem
              key={acompte.uuid}
              acompte={acompte}
              onAction={handleAction}
              paymentPending={togglePaid.isPending && togglePaid.variables?.uuid === acompte.uuid}
            />
          ))}
        </ul>
        <SimplePagination
          page={query.data?.currentPage ?? 0}
          totalPages={query.data?.totalPages ?? 1}
          onPageChange={setPage}
          disabled={query.isFetching}
        />
      </ListState>
    </div>
  )
}
