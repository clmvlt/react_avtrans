import { Skeleton } from '@/components/ui/skeleton'

/** Chargement de la page /notifications : onglets et quelques cartes. */
export function NotificationListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des notifications...">
      <Skeleton className="h-9 w-full rounded-lg sm:w-80" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex gap-3 rounded-xl border bg-card p-4 sm:gap-4">
            <Skeleton className="size-10 shrink-0 rounded-lg sm:size-12" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
