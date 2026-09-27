import { Skeleton } from '@/components/ui/skeleton'

/** Chargement du tableau de bord : en-tête de section et 6 cartes (Entretiens.vue). */
export function FleetDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="size-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-44" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
