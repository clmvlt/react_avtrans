import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Chargement du détail, sous l'en-tête de la page : cartes clés, informations, onglets. */
export function VehicleDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du véhicule...">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className={cn(
                'space-y-2 rounded-xl border bg-card p-4',
                index === 0 && 'col-span-2 lg:col-span-1',
              )}
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="flex flex-col gap-5 sm:flex-row">
            <Skeleton className="size-24 shrink-0 rounded-lg sm:size-28" />
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex gap-2 overflow-hidden border-b px-4 py-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-7 w-24 shrink-0" />
          ))}
        </div>
        <div className="p-4 sm:p-6">
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    </div>
  )
}
