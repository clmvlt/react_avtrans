import { Fragment, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFnOption,
  type OnChangeFn,
  type Row,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { Inbox, type LucideIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // Paramètres imposés par la déclaration d'origine (fusion d'interface).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Classes du `<th>` (largeur, `text-right`…). */
    headerClassName?: string
    /** Classes de chaque `<td>` de la colonne. */
    cellClassName?: string
  }
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Identifiant stable d'une ligne (uuid, id) ; l'index sinon. */
  getRowId?: (row: TData, index: number) => string

  /** Tri initial (non contrôlé), ex. `[{ id: 'immat', desc: false }]`. */
  initialSorting?: SortingState
  /** Tri contrôlé (avec `onSortingChange`), par exemple pour un tri côté serveur. */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  /** Tri fait par l'API : les lignes restent dans l'ordre reçu. */
  manualSorting?: boolean
  /** 3ᵉ clic = plus de tri (Entretiens). Par défaut asc ↔ desc, comme la plupart des tables Vue. */
  enableSortingRemoval?: boolean

  /** Texte de recherche appliqué à toutes les colonnes filtrables (filtre client). */
  globalFilter?: string
  /** Fonction de filtre global (`'includesString'` par défaut, insensible à la casse). */
  globalFilterFn?: FilterFnOption<TData>

  /** Contenu complet de la ligne vide ; sinon icône + message ci-dessous. */
  emptyState?: ReactNode
  emptyIcon?: LucideIcon
  emptyMessage?: ReactNode

  /** Classes d'une ligne selon son élément (ex. ligne grisée d'un utilisateur masqué). */
  getRowClassName?: (row: TData) => string | undefined
  onRowClick?: (row: TData) => void
  onRowContextMenu?: (event: MouseEvent<HTMLTableRowElement>, row: TData) => void
  /**
   * Enveloppe le `<tr>` rendu, par exemple dans un menu contextuel shadcn :
   * `renderRow={(row, tr) => <ContextMenu><ContextMenuTrigger asChild>{tr}</ContextMenuTrigger>…</ContextMenu>}`
   */
  renderRow?: (row: Row<TData>, rowElement: ReactElement) => ReactNode

  /** Classes du conteneur (bordure arrondie par défaut ; ajouter `hidden md:block` au besoin). */
  className?: string
  tableClassName?: string
}

/**
 * Table de données générique (pattern data-table de shadcn, @tanstack/react-table) : tri client ou
 * serveur, filtre global optionnel, état vide, classes et menu contextuel par ligne. Pas de
 * pagination intégrée : les listes sont paginées par l'API (`SimplePagination`,
 * `DataTablePagination`). En-têtes triables : `DataTableColumnHeader`.
 * Classes par colonne : `meta: { headerClassName, cellClassName }`.
 *
 * @example
 * const columns: ColumnDef<VehiculeDTO>[] = [
 *   { accessorKey: 'immat', header: ({ column }) => <DataTableColumnHeader column={column} title="Immatriculation" /> },
 *   { id: 'actions', cell: ({ row }) => <RowActions vehicule={row.original} />, meta: { headerClassName: 'text-right' } },
 * ]
 * <DataTable columns={columns} data={vehicules} getRowId={(v) => v.id} globalFilter={search}
 *   emptyIcon={Truck} emptyMessage="Aucun véhicule trouvé" className="hidden md:block" />
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  initialSorting = [],
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  enableSortingRemoval = false,
  globalFilter,
  globalFilterFn = 'includesString',
  emptyState,
  emptyIcon: EmptyIcon = Inbox,
  emptyMessage = 'Aucun résultat',
  getRowClassName,
  onRowClick,
  onRowContextMenu,
  renderRow,
  className,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(initialSorting)
  const sorting = controlledSorting ?? internalSorting

  // TanStack Table renvoie une instance mutable : le React Compiler ne mémoïse pas ce composant
  // (comportement voulu, c'est ce que signale la règle). La table est entièrement rendue ici.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
      ...(globalFilter !== undefined ? { globalFilter } : {}),
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    manualSorting,
    enableSortingRemoval,
    enableMultiSort: false,
    sortDescFirst: false,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      <Table className={tableClassName}>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={
                      header.column.getCanSort()
                        ? sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => {
              const rowElement = (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer', getRowClassName?.(row.original))}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onContextMenu={
                    onRowContextMenu ? (event) => onRowContextMenu(event, row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
              return renderRow ? (
                <Fragment key={row.id}>{renderRow(row, rowElement)}</Fragment>
              ) : (
                rowElement
              )
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="py-12 text-center"
              >
                {emptyState ?? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <EmptyIcon className="size-10 opacity-50" />
                    <p>{emptyMessage}</p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
