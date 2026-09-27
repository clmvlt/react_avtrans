import { Skeleton } from '@/components/ui/skeleton'

const DAYS = [0, 1]
const ROWS = [0, 1, 2]

/** Chargement de la liste des pointages : deux journées de trois lignes. */
export function ServicesListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Chargement des services...</span>
      {DAYS.map((day) => (
        <div key={day} className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="flex flex-col gap-1 p-2 sm:p-3">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-3 p-3">
                <Skeleton className="h-8 w-1 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
