import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type HoursPageSkeletonProps = {
  /** Nombre de cartes de statistiques (5 pour Heures, 4 pour Contrats). */
  statCount: number
  /** Classes de la grille des cartes (mêmes colonnes que l'écran chargé). */
  statsClassName: string
  /** Libellé lu par les lecteurs d'écran. */
  label: string
}

/** Chargement des pages Heures et Contrats : cartes, recherche et lignes fantômes. */
export function HoursPageSkeleton({ statCount, statsClassName, label }: HoursPageSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label={label}>
      <div className={cn('grid gap-4', statsClassName)}>
        {Array.from({ length: statCount }, (_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg border bg-card p-5">
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="space-y-3 rounded-lg border p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
