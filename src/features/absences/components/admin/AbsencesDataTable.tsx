import { CalendarX } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { AbsenceDTO } from '@/models'
import { getAbsenceColumns } from './absenceColumns'
import { getAbsenceMenuEntries, type AbsenceActionHandler } from './absenceRowActions'

type AbsencesDataTableProps = {
  absences: AbsenceDTO[]
  totalElements: number
  onAction: AbsenceActionHandler
}

/**
 * Table desktop (md+) des absences : colonnes triables, boutons d'action par ligne et menu
 * contextuel (clic droit) titré du nom de l'employé.
 */
export function AbsencesDataTable({ absences, totalElements, onAction }: AbsencesDataTableProps) {
  return (
    <DataTable
      columns={getAbsenceColumns(totalElements, onAction)}
      data={absences}
      getRowId={(absence, index) => absence.uuid ?? String(index)}
      emptyIcon={CalendarX}
      emptyMessage="Aucune absence trouvée"
      className="hidden md:block"
      renderRow={(row, rowElement) => {
        const absence = row.original
        return (
          <ContextMenu>
            <ContextMenuTrigger asChild>{rowElement}</ContextMenuTrigger>
            <ContextMenuContent className="min-w-48">
              <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
                {`${absence.user?.firstName ?? ''} ${absence.user?.lastName ?? ''}`}
              </ContextMenuLabel>
              <ContextMenuSeparator />
              {getAbsenceMenuEntries(absence).map((entry) =>
                entry.kind === 'separator' ? (
                  <ContextMenuSeparator key={entry.key} />
                ) : (
                  <ContextMenuItem
                    key={entry.action}
                    variant={entry.tone === 'destructive' ? 'destructive' : 'default'}
                    className={entry.tone === 'success' ? 'text-green-600' : undefined}
                    onSelect={() => onAction(entry.action, absence)}
                  >
                    <entry.icon className="size-4 text-current" />
                    {entry.label}
                  </ContextMenuItem>
                ),
              )}
            </ContextMenuContent>
          </ContextMenu>
        )
      }}
    />
  )
}
