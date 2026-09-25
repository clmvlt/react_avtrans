import { Skeleton } from '@/components/ui/skeleton'

/** Chargement du détail : fiche du véhicule puis barre d'onglets. */
export function VehicleDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du véhicule...">
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-8 w-28" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="size-[72px] shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="size-[88px] shrink-0 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t px-5 py-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex gap-2 bg-muted px-4 pt-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-12 rounded-b-none sm:w-28" />
          ))}
        </div>
        <div className="p-6">
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    </div>
  )
}
