import { Skeleton } from '@/components/ui/skeleton'

/** Squelette du premier chargement de /mycouchettes (même mise en page que le contenu). */
export function MesCouchettesSkeleton() {
  return (
    <div
      className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-6"
      aria-busy="true"
      aria-label="Chargement des couchettes..."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-8 w-64" />
          <Skeleton className="mt-3 h-3 w-48" />
          <Skeleton className="mt-6 h-14 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Skeleton className="h-[68px]" />
          <Skeleton className="h-[68px]" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
