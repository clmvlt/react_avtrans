import { Skeleton } from '@/components/ui/skeleton'

/** Chargement de la liste admin : barre de recherche et lignes du tableau. */
export function AppVersionsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des versions...">
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-3">
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b p-3 last:border-b-0">
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
