import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type TabContentSkeletonProps = {
  /**
   * - `files` : grille de vignettes carrées ;
   * - `cards` : cartes empilées (commentaires, rapports) ;
   * - `grid` : cartes en grille (équipements) ;
   * - `timeline` : graphique puis historique (kilométrages).
   */
  variant: 'files' | 'cards' | 'grid' | 'timeline'
  /** Libellé lu par les lecteurs d'écran (« Chargement des fichiers... »). */
  label: string
}

/** Squelette d'un onglet du détail véhicule pendant son premier chargement. */
export function TabContentSkeleton({ variant, label }: TabContentSkeletonProps) {
  return (
    <div aria-busy="true" aria-label={label}>
      {variant === 'files' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="aspect-square rounded-none" />
              <div className="space-y-1 border-t p-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(variant === 'cards' || variant === 'grid') && (
        <div
          className={cn(
            variant === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3',
          )}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {variant === 'timeline' && (
        <div className="space-y-6">
          <Skeleton className="aspect-[2/1] w-full rounded-xl" />
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="size-3 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
