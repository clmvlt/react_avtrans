import { ClipboardList, Search } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { ErrorState } from '@/components/shared/ErrorState'
import { SearchFilters, type FilterConfig } from '@/components/shared/SearchFilters'
import { Input } from '@/components/ui/input'
import type { EntretiensHistoryState } from '../../hooks/useEntretiensHistory'
import type { EntretienRowActions } from '../../lib/entretienRow'
import { EmptyBlock } from '../EmptyBlock'
import { getEntretienColumns } from './entretienColumns'
import { EntretienContextMenu } from './EntretienContextMenu'
import { EntretienMobileCard } from './EntretienMobileCard'
import { EntretiensHistorySkeleton } from './EntretiensHistorySkeleton'
import { EntretiensTotalCost } from './EntretiensTotalCost'

type EntretiensHistoryProps = EntretienRowActions & {
  history: EntretiensHistoryState
  filterConfig: FilterConfig[]
  /**
   * - `fleet` (/entretiens) : recherche rapide, colonne « Véhicule », menu du clic droit ; les
   *   squelettes n'apparaissent qu'au premier chargement ;
   * - `vehicule` (/entretiens/vehicule/:id) : squelettes à chaque recherche ou changement de page.
   */
  variant: 'fleet' | 'vehicule'
  canManage: boolean
}

/** Historique des entretiens : filtres, cartes (mobile), table (desktop), total et pagination. */
export function EntretiensHistory({
  history,
  filterConfig,
  variant,
  canManage,
  ...actions
}: EntretiensHistoryProps) {
  const isFleet = variant === 'fleet'
  const { query, rows, totalElements } = history
  const showSkeleton = isFleet ? query.isPending : query.isPending || query.isPlaceholderData
  const plural = totalElements > 1 ? 's' : ''

  const columns = getEntretienColumns({ showVehicle: isFleet, canManage, ...actions })

  const renderContent = () => {
    if (showSkeleton) return <EntretiensHistorySkeleton showVehicle={isFleet} />

    if (query.isError) {
      return (
        <ErrorState
          message={
            isFleet
              ? "Erreur lors du chargement de l'historique"
              : 'Erreur lors du chargement des entretiens'
          }
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      )
    }

    if (rows.length === 0) {
      return (
        <EmptyBlock icon={ClipboardList}>
          <p className="text-lg text-muted-foreground">Aucun entretien trouvé</p>
        </EmptyBlock>
      )
    }

    return (
      <div>
        <div className="space-y-3 md:hidden">
          <p className="text-sm text-muted-foreground">{totalElements} entretien(s)</p>
          {rows.map((entretien, index) => (
            <EntretienMobileCard
              key={entretien.id ?? index}
              entretien={entretien}
              showVehicle={isFleet}
              canManage={canManage}
              {...actions}
            />
          ))}
        </div>

        {history.totalCost > 0 && <EntretiensTotalCost total={history.totalCost} />}

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(entretien, index) => entretien.id ?? String(index)}
          sorting={history.sorting}
          onSortingChange={history.setSorting}
          manualSorting
          enableSortingRemoval
          onRowClick={canManage ? actions.onEdit : undefined}
          renderRow={
            isFleet
              ? (row, rowElement) => (
                  <EntretienContextMenu entretien={row.original} canManage={canManage} {...actions}>
                    {rowElement}
                  </EntretienContextMenu>
                )
              : undefined
          }
          className="hidden md:block"
        />
      </div>
    )
  }

  return (
    <>
      {isFleet && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={history.quickSearch}
            onChange={(event) => history.setQuickSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') history.search()
            }}
            placeholder="Recherche rapide par immatriculation, type, mécanicien, commentaire..."
            aria-label="Recherche rapide"
            className="pl-9"
          />
        </div>
      )}

      <SearchFilters
        value={history.filters}
        onChange={history.setFilters}
        filters={filterConfig}
        loading={isFleet ? query.isPending : query.isFetching}
        columns={4}
        hint={`${totalElements} entretien${plural} trouvé${plural}`}
        onSearch={history.search}
        onReset={history.reset}
      />

      {renderContent()}

      {!showSkeleton && !query.isError && (
        <DataTablePagination
          variant="centered"
          page={history.page}
          totalPages={history.totalPages}
          totalElements={totalElements}
          totalLabel="entretiens"
          onPageChange={history.goToPage}
        />
      )}
    </>
  )
}
