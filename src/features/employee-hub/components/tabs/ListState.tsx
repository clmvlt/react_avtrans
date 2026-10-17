import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

type ListStateProps = {
  isPending: boolean
  error: Error | null
  isRetrying: boolean
  onRetry: () => void
  isEmpty: boolean
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  /** Bouton d'ajout sous l'état vide */
  emptyAction?: ReactNode
  loadingLabel: string
  children: ReactNode
}

/**
 * États d'une liste d'onglet de la fiche : squelette, erreur avec « Réessayer », vide explicite,
 * sinon la liste.
 */
export function ListState({
  isPending,
  error,
  isRetrying,
  onRetry,
  isEmpty,
  emptyIcon: Icon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  loadingLabel,
  children,
}: ListStateProps) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <span className="sr-only">{loadingLabel}</span>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} isRetrying={isRetrying} />
  if (isEmpty) {
    return (
      <Empty className="rounded-xl border py-12">
        <EmptyMedia>
          <Icon className="size-10 text-muted-foreground/60" />
        </EmptyMedia>
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        <EmptyDescription>{emptyDescription}</EmptyDescription>
        {emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
      </Empty>
    )
  }
  return children
}
