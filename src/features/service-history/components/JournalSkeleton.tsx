import { Skeleton } from '@/components/ui/skeleton'

/** Premier chargement du journal : compteur et lignes fantômes. */
export function JournalSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement du journal...">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3 rounded-lg border p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
