import { Skeleton } from '@/components/ui/skeleton'

/** Chargement initial de /couchettes : bouton, barre de filtres, cartes (mobile) ou table. */
export function CouchettesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des couchettes...">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-44" />
      </div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Mobile : cartes */}
      <div className="space-y-3 md:hidden">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] w-full rounded-lg" />
        ))}
      </div>

      {/* Desktop : table */}
      <div className="hidden overflow-hidden rounded-lg border shadow-sm md:block">
        <div className="border-b px-2 py-3">
          <Skeleton className="h-4 w-40" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-6 border-b p-2 last:border-0">
            <div className="flex flex-1 items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-44" />
          </div>
        ))}
      </div>
    </div>
  )
}
