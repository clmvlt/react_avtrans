import { formatDateCompact } from '@/features/absences/lib/dateFormat'
import type { AcompteDTO } from '@/models'
import { formatMontant } from '@/utils/acompteFormatters'

type MyAcompteCancelSummaryProps = {
  acompte: AcompteDTO | null
}

/** Résumé de la demande dans le dialog « Annuler la demande » : montant, raison, date. */
export function MyAcompteCancelSummary({ acompte }: MyAcompteCancelSummaryProps) {
  if (!acompte) return null

  return (
    <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Montant</span>
        <span className="font-medium tabular-nums">{formatMontant(acompte.montant)}</span>
      </div>
      {acompte.raison && (
        <div className="flex justify-between gap-3 text-sm">
          <span className="shrink-0 text-muted-foreground">Raison</span>
          <span className="text-right font-medium">{acompte.raison}</span>
        </div>
      )}
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Demandé le</span>
        <span className="font-medium">{formatDateCompact(acompte.createdAt)}</span>
      </div>
    </div>
  )
}
