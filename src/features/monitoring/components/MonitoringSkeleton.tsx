import { Skeleton } from '@/components/ui/skeleton'

const CARDS = Array.from({ length: 6 }, (_, index) => index)

/** Chargement du suivi des présences : recherche, puis une grille de cartes. */
export function MonitoringSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Chargement des services...</span>
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {CARDS.map((card) => (
            <div
              key={card}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 md:gap-3 md:p-4"
            >
              <Skeleton className="size-12 rounded-full md:size-14" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
