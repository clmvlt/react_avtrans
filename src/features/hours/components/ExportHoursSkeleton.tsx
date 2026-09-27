import { Skeleton } from '@/components/ui/skeleton'

/** Chargement des utilisateurs de l'export : cartes « Période » et « Employés » fantômes. */
export function ExportHoursSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des utilisateurs...">
      <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-5 shrink-0" />
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-full sm:w-44" />
      </div>
    </div>
  )
}
