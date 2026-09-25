import { DataTable } from '@/components/shared/DataTable'
import type { AppVersionDTO } from '@/models'
import { AppVersionContextMenu } from './AppVersionContextMenu'
import { getAppVersionColumns } from './appVersionColumns'

type AppVersionsTableProps = {
  /** Versions déjà filtrées par la recherche et triées par build décroissant */
  versions: AppVersionDTO[]
  onEdit: (version: AppVersionDTO) => void
  onDelete: (version: AppVersionDTO) => void
}

/** Tableau admin des versions, avec menu au clic droit sur chaque ligne. */
export function AppVersionsTable({ versions, onEdit, onDelete }: AppVersionsTableProps) {
  const columns = getAppVersionColumns({ onEdit, onDelete })

  return (
    <DataTable
      columns={columns}
      data={versions}
      getRowId={(version) => version.id}
      emptyState={<span className="text-muted-foreground">Aucune version trouvée</span>}
      renderRow={(row, rowElement) => (
        <AppVersionContextMenu version={row.original} onEdit={onEdit} onDelete={onDelete}>
          {rowElement}
        </AppVersionContextMenu>
      )}
    />
  )
}
