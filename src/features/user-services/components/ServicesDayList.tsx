import { ClipboardList, Plus } from 'lucide-react'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import type { ServiceDTO } from '@/models'
import type { PagedResponse } from '@/types'
import { groupServicesByDay } from '../lib/groupServicesByDay'
import { ServiceDayCard } from './ServiceDayCard'
import type { ServiceRowHandlers } from './ServiceRowActions'
import { ServicesListSkeleton } from './ServicesListSkeleton'

type ServicesDayListProps = {
  /** Page reçue (la précédente reste affichée pendant le chargement d'une autre page) */
  data: PagedResponse<ServiceDTO> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  handlers: ServiceRowHandlers
  onAdd: () => void
  onAddForDate: (date: string) => void
}

/** Pointages de la page, regroupés par journée, avec états de chargement, d'erreur et vide. */
export function ServicesDayList({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  handlers,
  onAdd,
  onAddForDate,
}: ServicesDayListProps) {
  if (isLoading) return <ServicesListSkeleton />

  if (isError) {
    return (
      <ErrorState
        message="Erreur lors du chargement des services"
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    )
  }

  const services = data?.content ?? []
  const days = groupServicesByDay(services)

  return (
    <div className="space-y-4">
      {days.length > 0 ? (
        <div className="space-y-4">
          {days.map((day) => (
            <ServiceDayCard
              key={day.date}
              day={day}
              handlers={handlers}
              onAddForDate={onAddForDate}
            />
          ))}
        </div>
      ) : (
        <Empty className="gap-4 rounded-xl border px-4 py-16 md:px-4 md:py-16">
          <ClipboardList className="size-10 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Aucun service trouvé</p>
          <Button onClick={onAdd}>
            <Plus className="size-4" />
            Ajouter un service
          </Button>
        </Empty>
      )}

      {data && services.length > 0 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={onPageChange}
          disabled={isFetching}
          className="rounded-xl px-4 py-2"
        />
      )}
    </div>
  )
}
