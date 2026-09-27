import type { ComponentProps } from 'react'
import type { AbsenceDTO } from '@/models'
import { useAbsenceDecompteQuery } from '../api/useAbsenceDecompteQuery'
import { buildDecompteRequest } from '../lib/absenceDecompte'
import { CUSTOM_ABSENCE_TYPE } from '../schemas/absence'
import { AbsenceDecompteSummary } from './AbsenceDecompteSummary'

type AbsenceDecompteDetailProps = Omit<ComponentProps<'div'>, 'children'> & {
  absence: AbsenceDTO
  /** `my` : l'employé consulte sa demande ; `admin` : n'importe quelle absence. */
  scope: 'my' | 'admin'
}

/**
 * Décompte d'une absence enregistrée (D8) : détail jour par jour recalculé par l'API, heures
 * fixées à la main reprises de l'absence.
 */
export function AbsenceDecompteDetail({ absence, scope, ...props }: AbsenceDecompteDetailProps) {
  const request = buildDecompteRequest(
    {
      startDate: String(absence.startDate ?? '').split('T')[0] ?? '',
      endDate: String(absence.endDate ?? '').split('T')[0] ?? '',
      period: absence.period || 'FULL_DAY',
      absenceTypeUuid: absence.absenceType?.uuid || CUSTOM_ABSENCE_TYPE,
      userUuid: absence.user?.uuid,
    },
    scope,
  )
  const decompteQuery = useAbsenceDecompteQuery(scope, request)

  if (!request) return null

  return (
    <AbsenceDecompteSummary
      decompte={decompteQuery.data}
      isPending={decompteQuery.isPending}
      isError={decompteQuery.isError}
      isStale={decompteQuery.isPlaceholderData}
      onRetry={() => void decompteQuery.refetch()}
      heuresForcees={absence.heuresForcees}
      {...props}
    />
  )
}
