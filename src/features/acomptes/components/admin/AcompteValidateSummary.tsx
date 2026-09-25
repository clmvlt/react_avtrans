import { SummaryRow } from '@/features/absences/components/SummaryRow'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'

type AcompteValidateSummaryProps = {
  acompte: AcompteDTO | null
}

/** Résumé d'un acompte dans le dialog d'approbation / de refus : employé, montant, raison. */
export function AcompteValidateSummary({ acompte }: AcompteValidateSummaryProps) {
  if (!acompte) return null

  return (
    <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
      <SummaryRow label="Employé">
        {acompte.user?.firstName} {acompte.user?.lastName}
      </SummaryRow>
      <SummaryRow label="Montant" valueClassName="font-semibold text-green-600 dark:text-green-400">
        {formatMontantAdmin(acompte.montant)}
      </SummaryRow>
      <SummaryRow label="Raison">{acompte.raison || '-'}</SummaryRow>
    </div>
  )
}
