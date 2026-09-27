import { useWatch, type Control } from 'react-hook-form'
import { useAbsenceDecompteQuery } from '../api/useAbsenceDecompteQuery'
import { buildDecompteRequest } from '../lib/absenceDecompte'
import type { AbsenceFormValues } from '../schemas/absence'
import { AbsenceDecompteSummary } from './AbsenceDecompteSummary'

type AbsenceDecomptePreviewProps = {
  control: Control<AbsenceFormValues>
  /** `my` : contrat de l'employé connecté ; `admin` : contrat de l'employé choisi. */
  scope: 'my' | 'admin'
}

/**
 * Aperçu en direct des heures créditées par l'absence en cours de saisie (D8), recalculé par
 * l'API 300 ms après la dernière modification des dates, de la période, du type ou de l'employé.
 */
export function AbsenceDecomptePreview({ control, scope }: AbsenceDecomptePreviewProps) {
  const [startDate, endDate, period, absenceTypeUuid, userUuid] = useWatch({
    control,
    name: ['startDate', 'endDate', 'period', 'absenceTypeUuid', 'userUuid'],
  })
  const request = buildDecompteRequest(
    { startDate, endDate, period, absenceTypeUuid, userUuid },
    scope,
  )
  const decompteQuery = useAbsenceDecompteQuery(scope, request, { debounce: true })

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Heures créditées</span>
      {request ? (
        <AbsenceDecompteSummary
          decompte={decompteQuery.data}
          isPending={decompteQuery.isPending}
          isError={decompteQuery.isError}
          isStale={decompteQuery.isPlaceholderData || decompteQuery.isFetching}
          onRetry={() => void decompteQuery.refetch()}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          {scope === 'admin' && !userUuid
            ? "Choisissez l'employé, les dates et le type pour voir les heures créditées."
            : 'Choisissez les dates et le type pour voir les heures créditées.'}
        </p>
      )}
    </div>
  )
}
