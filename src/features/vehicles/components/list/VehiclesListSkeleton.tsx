import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 6

/** Chargement de la liste : barre de recherche, puis cartes (mobile) ou lignes de table (desktop). */
export function VehiclesListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des véhicules...">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="space-y-3 md:hidden">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="mt-3 h-4 w-40" />
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <div className="flex h-10 items-center gap-6 border-b px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-6 border-b p-2 last:border-b-0">
            <div className="flex w-56 items-center gap-3">
              <Skeleton className="size-11 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-8 w-56" />
          </div>
        ))}
      </div>
    </div>
  )
}
