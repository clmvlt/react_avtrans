import { Skeleton } from '@/components/ui/skeleton'

const ROWS = Array.from({ length: 6 }, (_, index) => index)

/** Chargement de la page Utilisateurs : barre de recherche, puis cartes (mobile) ou tableau. */
export function UsersPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Chargement des utilisateurs...</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-full sm:w-52" />
      </div>

      <div className="space-y-3 md:hidden">
        <Skeleton className="h-4 w-28" />
        {ROWS.slice(0, 4).map((row) => (
          <div key={row} className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="w-48 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="ml-auto h-8 w-72" />
          </div>
        ))}
      </div>
    </div>
  )
}
