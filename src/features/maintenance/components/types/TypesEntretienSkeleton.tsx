import { Skeleton } from '@/components/ui/skeleton'

/**
 * Chargement de /types-entretien : barre des dossiers (colonne en desktop, bande en mobile) et
 * cartes de types.
 */
export function TypesEntretienSkeleton() {
  return (
    <div
      role="status"
      aria-label="Chargement..."
      className="mx-auto grid w-full max-w-[1600px] grid-cols-1 md:grid-cols-[280px_1fr]"
    >
      <div className="border-b md:h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="size-8" />
        </div>
        <div className="flex flex-wrap gap-2 p-2 md:flex-col md:flex-nowrap md:gap-1">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-28 md:w-full" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <Skeleton className="size-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
