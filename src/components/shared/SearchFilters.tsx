import { useId, useState, type ComponentProps } from 'react'
import { ChevronDown, LoaderCircle, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type FilterOption = {
  value: string | number
  label: string
}

export type FilterConfig = {
  /** Clé de la valeur dans l'objet `value`. */
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'number' | 'checkbox'
  placeholder?: string
  /** Options d'un filtre `select` (valeurs `string` ou `number`, rendues telles quelles). */
  options?: FilterOption[]
  /** Occupe toute la largeur de la grille. */
  fullWidth?: boolean
  /** Libellé à côté de la case d'un filtre `checkbox` (par défaut `label`). */
  checkboxLabel?: string
  min?: number
  max?: number
}

/** Valeurs des filtres : `select` → valeur d'option ou `''`, `number` → nombre ou `''`, `checkbox` → booléen. */
export type FilterValues = Record<string, unknown>

type SearchFiltersProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  value: FilterValues
  onChange: (value: FilterValues) => void
  filters: FilterConfig[]
  /** Recherche en cours : bouton « Recherche... » désactivé. */
  loading?: boolean
  /** Colonnes de la grille à partir de `lg` (1 à 6, 4 par défaut) ; 2 sous `lg`, 1 sous `sm`. */
  columns?: number
  /** Panneau ouvert au départ (par défaut : ouvert sur grand écran, replié sur téléphone). */
  defaultExpanded?: boolean
  /** Résumé des filtres actifs (ou nombre de résultats), sous le titre « Filtres ». */
  hint?: string
  onSearch?: () => void
  onReset?: () => void
}

const GRID_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

const toText = (raw: unknown) => (raw === undefined || raw === null ? '' : String(raw))

/**
 * Carte de filtres repliable, configurée par un tableau : en-tête « Filtres » + résumé, champs en
 * grille, pied « Réinitialiser » / « Rechercher ». Ouverte d'office sur grand écran.
 * Contrôlé : `value` + `onChange` (objet complet). « Rechercher » appelle `onSearch`, Entrée dans
 * un champ texte aussi ; « Réinitialiser » appelle `onReset` (la page remet ses valeurs par défaut).
 *
 * Corrigé par rapport au Vue : `0` n'est plus affiché vide, un `select` à valeurs numériques rend
 * un `number` (et non une chaîne), un filtre `number` rend un `number` (ou `''` si vide).
 * Un `select` a une recherche au-delà de 5 options et peut toujours être effacé (`''`).
 *
 * @example
 * const filters: FilterConfig[] = [
 *   { key: 'status', label: 'Statut', type: 'select', options: STATUS_OPTIONS },
 *   { key: 'startDate', label: 'Du', type: 'date' },
 * ]
 * <SearchFilters value={draft} onChange={setDraft} filters={filters} columns={5}
 *   loading={isFetching} hint={activeFiltersText} onSearch={apply} onReset={reset} />
 */
export function SearchFilters({
  value,
  onChange,
  filters,
  loading = false,
  columns = 4,
  defaultExpanded,
  hint,
  onSearch,
  onReset,
  className,
  ...props
}: SearchFiltersProps) {
  const idPrefix = useId()
  const [showFilters, setShowFilters] = useState(
    () => defaultExpanded ?? window.matchMedia('(min-width: 1024px)').matches,
  )
  const hasFilters = filters.length > 0

  const updateFilter = (key: string, next: unknown) => onChange({ ...value, [key]: next })
  const fieldId = (key: string) => `${idPrefix}-filter-${key}`

  const renderField = (filter: FilterConfig) => {
    const id = fieldId(filter.key)
    const current = value[filter.key]

    switch (filter.type) {
      case 'select': {
        const options = filter.options ?? []
        return (
          <Combobox
            id={id}
            value={toText(current)}
            options={options.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            placeholder={filter.placeholder || 'Tous'}
            searchable={options.length > 5}
            clearable
            onValueChange={(selected) => {
              const option = options.find((o) => String(o.value) === selected)
              updateFilter(filter.key, option ? option.value : '')
            }}
          />
        )
      }
      case 'date':
        return (
          <Input
            id={id}
            type="date"
            value={toText(current)}
            onChange={(event) => updateFilter(filter.key, event.target.value)}
          />
        )
      case 'text':
        return (
          <Input
            id={id}
            type="text"
            value={toText(current)}
            placeholder={filter.placeholder}
            onChange={(event) => updateFilter(filter.key, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearch?.()
            }}
          />
        )
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={toText(current)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            onChange={(event) =>
              updateFilter(filter.key, event.target.value === '' ? '' : event.target.valueAsNumber)
            }
          />
        )
      case 'checkbox':
        return (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <Checkbox
              id={id}
              checked={Boolean(current)}
              onCheckedChange={(checked) => updateFilter(filter.key, checked === true)}
            />
            <span>{filter.checkboxLabel || filter.label}</span>
          </label>
        )
    }
  }

  return (
    <Collapsible
      open={showFilters && hasFilters}
      onOpenChange={setShowFilters}
      className={cn('w-full rounded-xl border bg-card', className)}
      {...props}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Filtres</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        {hasFilters ? (
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="shrink-0">
              {showFilters ? 'Masquer' : 'Modifier'}
              <ChevronDown
                className={cn('size-4 transition-transform', showFilters && 'rotate-180')}
              />
            </Button>
          </CollapsibleTrigger>
        ) : (
          <Button type="button" size="sm" disabled={loading} onClick={onSearch}>
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Actualiser
          </Button>
        )}
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="border-t p-4">
          <div
            className={cn(
              'grid grid-cols-1 gap-4 sm:grid-cols-2',
              GRID_COLUMNS[columns] ?? GRID_COLUMNS[4],
            )}
          >
            {filters.map((filter) => (
              <div
                key={filter.key}
                className={cn('flex flex-col gap-2', filter.fullWidth && 'col-span-full')}
              >
                <label
                  htmlFor={fieldId(filter.key)}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {filter.label}
                </label>
                {renderField(filter)}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={onReset}>
              <RotateCcw className="size-4" />
              Réinitialiser
            </Button>
            <Button type="button" size="sm" disabled={loading} onClick={onSearch}>
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
