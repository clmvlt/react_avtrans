import { Skeleton } from '@/components/ui/skeleton'

/** Chargement initial du tableau : trois colonnes de cartes. */
export function TodoBoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Chargement des tâches..."
      className="flex flex-col items-start gap-4 md:flex-row"
    >
      {Array.from({ length: 3 }, (_, column) => (
        <div
          key={column}
          className="flex w-full flex-1 flex-col rounded-lg border bg-card md:min-w-[250px]"
        >
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-7 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 p-3">
            {Array.from({ length: 3 - column }, (_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
