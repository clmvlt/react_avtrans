import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_ROWS = 6

/** Chargement initial du planning : compteur et grille fantômes. */
export function PlanningSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement du planning...">
      <Skeleton className="h-4 w-40" />
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex border-b bg-muted/50 px-4 py-3">
          <Skeleton className="h-8 w-full" />
        </div>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-8 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
