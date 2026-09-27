import type { ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong, formatDateTime } from '../../lib/dateFormat'
import { legacySortingFn } from '../../lib/legacySortCompare'
import { AbsenceHeuresValue } from '../AbsenceHeuresValue'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { AbsenceActionsDropdown } from './AbsenceActionsDropdown'
import type { AbsenceActionHandler } from './absenceRowActions'

/**
 * Colonnes de la table admin des absences (desktop). Tri client sur la page affichée avec le
 * comparateur du Vue (B-19 reproduit). « Période » : durée suivie de « · Matin/Après-midi » pour
 * une demi-journée, d'où « 3 jours · Matin · Matin » sur plusieurs jours (B-29 reproduit).
 * « Heures » (D8) : heures créditées et jours décomptés, tri numérique simple.
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
      id: 'heures',
      accessorFn: (absence) => absence.heures ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Heures" />,
      sortingFn: 'basic',
      cell: ({ row: { original: absence } }) => <AbsenceHeuresValue absence={absence} />,
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
        // En attente : Approuver / Refuser visibles (icônes sous 2xl) ; le reste dans le menu « ⋮ »
        <div className="flex items-center justify-end gap-1">
          {absence.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-success/40 text-success hover:bg-success/10 hover:text-success max-2xl:size-8"
                title="Approuver"
                onClick={() => onAction('approve', absence)}
              >
                <Check className="size-4" />
                <span className="max-2xl:sr-only">Approuver</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive max-2xl:size-8"
                title="Refuser"
                onClick={() => onAction('reject', absence)}
              >
                <X className="size-4" />
                <span className="max-2xl:sr-only">Refuser</span>
              </Button>
            </>
          )}
          <AbsenceActionsDropdown absence={absence} onAction={onAction} />
        </div>
      ),
    },
  ]
}
