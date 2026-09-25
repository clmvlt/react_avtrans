import { UserIdentity } from '@/components/shared/UserIdentity'
import { DetailItem } from '@/features/absences/components/DetailItem'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'
import { AcompteStatusBadge } from '../AcompteStatusBadge'

type AcompteDeleteSummaryProps = {
  acompte: AcompteDTO | null
}

/** Contenu du dialog de suppression d'un acompte (port d'`AcompteDeleteModal.vue`). */
export function AcompteDeleteSummary({ acompte }: AcompteDeleteSummaryProps) {
  if (!acompte) return null

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="mb-2 font-medium text-foreground">
          Êtes-vous sûr de vouloir supprimer cet acompte ?
        </p>
        <p className="text-sm font-semibold text-destructive">Cette action est irréversible.</p>
      </div>

      <div className="border-b pb-4">
        <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">Employé</h4>
        <UserIdentity user={acompte.user} size="xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailItem label="Montant">
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
            {formatMontantAdmin(acompte.montant)}
          </span>
        </DetailItem>
        <DetailItem label="Statut">
          <AcompteStatusBadge status={acompte.status} />
        </DetailItem>
        {acompte.raison && (
          <DetailItem label="Raison" className="col-span-2">
            <span className="font-medium text-foreground">{acompte.raison}</span>
          </DetailItem>
        )}
      </div>
    </div>
  )
}
