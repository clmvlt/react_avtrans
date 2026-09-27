import { Skeleton } from '@/components/ui/skeleton'

type CartesListSkeletonProps = {
  /** Libellé lu par les lecteurs d'écran (« Chargement des cartes... »). */
  label: string
}

/** Chargement initial des listes de cartes et de types, sous l'en-tête : recherche, lignes. */
export function CartesListSkeleton({ label }: CartesListSkeletonProps) {
  return (
    <div role="status" aria-label={label} className="space-y-4">
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-t p-3">
            <Skeleton className="size-9 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
