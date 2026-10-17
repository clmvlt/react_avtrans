import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ServiceRowHandlers } from '@/features/user-services/components/ServiceRowActions'
import { ServicesDayList } from '@/features/user-services/components/ServicesDayList'
import { ServicesFilters } from '@/features/user-services/components/ServicesFilters'
import type { useUserServicesList } from '@/features/user-services/hooks/useUserServicesList'

type ServicesTabProps = {
  list: ReturnType<typeof useUserServicesList>
  handlers: ServiceRowHandlers
  /** Nouveau pointage : maintenant, ou prérempli au jour donné */
  onAdd: (date?: string) => void
}

/**
 * Pointages de l'employé (mêmes filtres, lignes et actions que ses pointages) ; les journées
 * passent sur deux colonnes sur très grand écran.
 */
export function ServicesTab({ list, handlers, onAdd }: ServicesTabProps) {
  const { filters, query } = list

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <ServicesFilters
            showFilters={filters.showFilters}
            onToggleFilters={filters.toggleFilters}
            filters={filters.draft}
            onFiltersChange={filters.setDraft}
            hasActiveFilters={filters.hasActiveFilters}
            onReset={list.reset}
            onApply={list.apply}
          />
        </div>
        <Button className="sm:mt-2" onClick={() => onAdd()}>
          <Plus className="size-4" />
          Ajouter un service
        </Button>
      </div>

      <ServicesDayList
        data={query.data}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => list.reload(0)}
        onPageChange={list.goToPage}
        handlers={handlers}
        onAdd={() => onAdd()}
        onAddForDate={onAdd}
        listClassName="3xl:grid 3xl:grid-cols-2 3xl:items-start 3xl:gap-4 3xl:space-y-0"
      />
    </div>
  )
}
