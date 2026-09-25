import { Skeleton } from '@/components/ui/skeleton'

/** Chargement initial de /signatures : recherche + lignes de la table. */
export function SignaturesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des signatures...">
      <Skeleton className="h-9 w-full" />
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <div className="border-b px-2 py-3">
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-b p-2 last:border-0">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="hidden h-5 w-24 rounded-full md:block" />
            <Skeleton className="hidden h-4 w-32 sm:block" />
            <Skeleton className="h-8 w-8 sm:w-56" />
          </div>
        ))}
      </div>
    </div>
  )
}
