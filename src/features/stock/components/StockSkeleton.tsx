import { Skeleton } from '@/components/ui/skeleton'

/** Chargement initial du stock, sous l'en-tête de la page : panneau des catégories et articles. */
export function StockSkeleton() {
  return (
    <div
      role="status"
      aria-label="Chargement..."
      className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start"
    >
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-wrap gap-2 p-2 md:flex-col md:flex-nowrap">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-28 md:w-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full sm:max-w-md" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <Skeleton className="size-10 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-7 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
