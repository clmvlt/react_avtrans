import { Skeleton } from '@/components/ui/skeleton'

/** Squelette de la mise en page pendant le chargement initial. */
export function PointageSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-12 w-56" />
          <Skeleton className="mt-3 h-3 w-48" />
          <div className="mt-6 hidden md:block">
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="h-[68px]" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        {[0, 1, 2].map((n) => (
          <Skeleton key={n} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
