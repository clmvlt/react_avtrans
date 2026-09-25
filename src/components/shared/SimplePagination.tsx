import type { ComponentProps } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SimplePaginationProps = Omit<ComponentProps<'nav'>, 'onChange'> & {
  /** Page courante, indexée à 0 (comme l'API). */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /**
   * - `default` : boutons outline « Précédent / Suivant », « Page x sur y » centré (listes admin :
   *   Absences, Acomptes, Couchettes, Journal) ;
   * - `card` : barre en carte, boutons ghost, « Page x / y » (pages « mes » et Pointage) ;
   * - `compact` : chevrons seuls, « Page x / y » (VehiculePagination).
   */
  variant?: 'default' | 'card' | 'compact'
  /** Affiche « Précédent » / « Suivant » à côté des chevrons (défaut : sauf en `compact`). */
  showLabels?: boolean
  /** Nombre total d'éléments, affiché « (n) » en variante `card` (historique de Pointage). */
  totalElements?: number
  /** Désactive les deux boutons (chargement en cours). */
  disabled?: boolean
}

/**
 * Pagination « précédent / suivant » ; rien n'est rendu si `totalPages ≤ 1`.
 *
 * @example
 * <SimplePagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
 * <SimplePagination variant="compact" page={page} totalPages={totalPages} onPageChange={setPage} />
 */
export function SimplePagination({
  page,
  totalPages,
  onPageChange,
  variant = 'default',
  showLabels = variant !== 'compact',
  totalElements,
  disabled = false,
  className,
  ...props
}: SimplePaginationProps) {
  if (totalPages <= 1) return null

  const buttonVariant = variant === 'default' ? 'outline' : 'ghost'
  const separator = variant === 'default' ? 'sur' : '/'

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        variant === 'default' && 'flex items-center justify-center gap-4 pt-4',
        variant === 'card' &&
          'flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2',
        variant === 'compact' && 'flex items-center justify-center gap-2 py-4',
        className,
      )}
      {...props}
    >
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        disabled={disabled || page <= 0}
        onClick={() => onPageChange(page - 1)}
        aria-label={showLabels ? undefined : 'Page précédente'}
      >
        <ChevronLeft className="size-4" />
        {showLabels && 'Précédent'}
      </Button>
      <span
        className={cn(
          'text-muted-foreground',
          variant === 'card' ? 'text-xs tabular-nums' : 'text-sm',
        )}
      >
        Page {page + 1} {separator} {totalPages}
        {variant === 'card' && totalElements !== undefined && (
          <span className="opacity-60"> ({totalElements})</span>
        )}
      </span>
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        disabled={disabled || page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label={showLabels ? undefined : 'Page suivante'}
      >
        {showLabels && 'Suivant'}
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}
