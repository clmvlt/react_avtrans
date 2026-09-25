import type { ComponentProps } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DataTablePaginationProps = Omit<ComponentProps<'nav'>, 'onChange'> & {
  /** Page courante, indexée à 0 (comme l'API). */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Nombre total d'éléments, affiché entre parenthèses. */
  totalElements?: number
  /** Nom des éléments après le total en variante `centered` (ex. `'entretiens'` → « (12 entretiens) »). */
  totalLabel?: string
  /**
   * - `bar` (défaut) : barre en carte, « Page x/y (total) » à gauche, 4 boutons ghost à droite
   *   (UserServices) ;
   * - `centered` : 4 boutons outline autour de « Page x sur y (n entretiens) » (Entretiens).
   */
  variant?: 'bar' | 'centered'
  /** Rien n'est rendu s'il n'y a qu'une page (défaut : `true` en `centered`, `false` en `bar`, comme le Vue). */
  hideOnSinglePage?: boolean
  /** Désactive les boutons (chargement en cours). */
  disabled?: boolean
}

/**
 * Pagination première / précédente / suivante / dernière (UserServices, Entretiens,
 * EntretiensVehicule).
 *
 * @example
 * <DataTablePagination page={page} totalPages={data.totalPages} totalElements={data.totalElements}
 *   onPageChange={setPage} />
 * <DataTablePagination variant="centered" totalLabel="entretiens" … />
 */
export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  totalElements,
  totalLabel,
  variant = 'bar',
  hideOnSinglePage = variant === 'centered',
  disabled = false,
  className,
  ...props
}: DataTablePaginationProps) {
  if (totalPages <= 0 || (hideOnSinglePage && totalPages <= 1)) return null

  const isFirst = page <= 0
  const isLast = page >= totalPages - 1
  const buttonVariant = variant === 'bar' ? 'ghost' : 'outline'

  const buttons = {
    first: (
      <Button
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label="Première page"
        disabled={disabled || isFirst}
        onClick={() => onPageChange(0)}
      >
        <ChevronsLeft className="size-4" />
      </Button>
    ),
    previous: (
      <Button
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label="Page précédente"
        disabled={disabled || isFirst}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
    ),
    next: (
      <Button
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label="Page suivante"
        disabled={disabled || isLast}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    ),
    last: (
      <Button
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label="Dernière page"
        disabled={disabled || isLast}
        onClick={() => onPageChange(totalPages - 1)}
      >
        <ChevronsRight className="size-4" />
      </Button>
    ),
  }

  if (variant === 'centered') {
    return (
      <nav
        aria-label="Pagination"
        className={cn('flex items-center justify-center gap-2 py-4', className)}
        {...props}
      >
        {buttons.first}
        {buttons.previous}
        <span className="px-3 text-sm text-muted-foreground">
          Page {page + 1} sur {totalPages}
          {totalElements !== undefined && (
            <span className="hidden sm:inline">
              {' '}
              ({totalElements}
              {totalLabel ? ` ${totalLabel}` : ''})
            </span>
          )}
        </span>
        {buttons.next}
        {buttons.last}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between rounded-lg border bg-card p-4', className)}
      {...props}
    >
      <span className="text-sm text-muted-foreground">
        Page {page + 1}/{totalPages}
        {totalElements !== undefined && (
          <span className="text-muted-foreground/60"> ({totalElements})</span>
        )}
      </span>
      <div className="flex gap-1">
        {buttons.first}
        {buttons.previous}
        {buttons.next}
        {buttons.last}
      </div>
    </nav>
  )
}
