import { Skeleton } from '@/components/ui/skeleton'

/** Chargement des utilisateurs de l'export : carte de paramètres fantôme. */
export function ExportHoursSkeleton() {
  return (
    <div
      className="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
      aria-busy="true"
      aria-label="Chargement des utilisateurs..."
    >
      <Skeleton className="h-7 w-52" />
      <div className="space-y-4 border-b pb-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-28" />
          ))}
        </div>
      </div>
      <div className="space-y-4 border-b pb-6">
        <Skeleton className="h-6 w-32" />
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
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
