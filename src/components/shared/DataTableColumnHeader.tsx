import type { ComponentProps, ReactNode } from 'react'
import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type DataTableColumnHeaderProps<TData, TValue> = Omit<ComponentProps<'button'>, 'title'> & {
  column: Column<TData, TValue>
  title: ReactNode
}

/**
 * En-tête de colonne triable pour `DataTable`, au rendu des tables Vue (Users, Vehicules, Heures…) :
 * libellé + `ArrowUpDown` estompé, puis `ArrowUp` / `ArrowDown` ; colonne triée en `text-primary`.
 * C'est un vrai bouton (tri au clavier) ; une colonne non triable affiche le libellé seul.
 *
 * @example
 * { accessorKey: 'immat', header: ({ column }) => <DataTableColumnHeader column={column} title="Immatriculation" /> }
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <>{title}</>

  const sorted = column.getIsSorted()

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'cursor-pointer rounded-sm text-left font-medium whitespace-nowrap select-none hover:text-foreground',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        sorted && 'text-primary',
        className,
      )}
      {...props}
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="ml-1 inline size-3" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="ml-1 inline size-3" />
      ) : (
        <ArrowUpDown className="ml-1 inline size-3 opacity-30" />
      )}
    </button>
  )
}
