import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong, formatDateTime } from '../../lib/dateFormat'
import { legacySortingFn } from '../../lib/legacySortCompare'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { canEditAbsence, type AbsenceActionHandler } from './absenceRowActions'

/**
 * Colonnes de la table admin des absences (desktop). Tri client sur la page affichée avec le
 * comparateur du Vue (B-19 reproduit). « Période » : durée suivie de « · Matin/Après-midi » pour
 * une demi-journée, d'où « 3 jours · Matin · Matin » sur plusieurs jours (B-29 reproduit).
 */
export function getAbsenceColumns(
  totalElements: number,
  onAction: AbsenceActionHandler,
): ColumnDef<AbsenceDTO>[] {
  return [
    {
      id: 'userName',
      accessorFn: (absence) =>
        `${absence.user?.firstName || ''} ${absence.user?.lastName || ''}`.trim(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Absences (${totalElements})`} />
      ),
      sortingFn: legacySortingFn,
      cell: ({ row: { original: absence } }) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={absence.user} />
          <span className="font-medium text-foreground">
            {absence.user?.firstName} {absence.user?.lastName}
          </span>
        </div>
      ),
    },
    {
      id: 'typeName',
      accessorFn: (absence) => absence.absenceType?.name || absence.customType || '',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: absence } }) =>
        absence.absenceType || absence.customType ? (
          <AbsenceTypeBadge absence={absence} />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      id: 'startDate',
      accessorFn: (absence) => absence.startDate,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Période" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: absence } }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">
            {formatDateLong(absence.startDate)}
            {absence.startDate !== absence.endDate && (
              <span> → {formatDateLong(absence.endDate)}</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
            {isHalfDay(absence.period) && ` · ${getPeriodLabel(absence.period)}`}
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      accessorFn: (absence) => absence.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: absence } }) => (
        <div className="flex flex-col items-start gap-1">
          <AbsenceStatusBadge status={absence.status} />
          {absence.validatedBy && absence.status !== 'PENDING' && (
            <span className="text-xs text-muted-foreground">
              par {absence.validatedBy.firstName} {absence.validatedBy.lastName}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'createdAt',
      accessorFn: (absence) => absence.createdAt,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Demandé le" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: absence } }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(absence.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: absence } }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          {absence.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                title="Approuver"
                onClick={() => onAction('approve', absence)}
              >
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                title="Refuser"
                onClick={() => onAction('reject', absence)}
              >
                Refuser
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            title="Détails"
            onClick={() => onAction('details', absence)}
          >
            Détails
          </Button>
          {canEditAbsence(absence) && (
            <Button
              size="sm"
              variant="outline"
              title="Modifier"
              onClick={() => onAction('edit', absence)}
            >
              Modifier
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            title="Supprimer"
            onClick={() => onAction('delete', absence)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]
}
