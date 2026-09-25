import { useId, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

type ComboboxProps = Omit<ComponentProps<'button'>, 'value' | 'defaultValue' | 'onChange'> & {
  /** Valeur sélectionnée (`''` = aucune). */
  value?: string
  /** Appelé avec la valeur choisie, ou `''` quand on efface la sélection. */
  onValueChange?: (value: string) => void
  options: ComboboxOption[]
  /** Libellé affiché au-dessus, relié au déclencheur. */
  label?: string
  /** Texte du déclencheur sans sélection (« Sélectionner... » par défaut). */
  placeholder?: string
  /** Astérisque après le libellé (visuel uniquement, comme le Vue). */
  required?: boolean
  /** Message d'erreur sous le champ (bordure rouge). */
  error?: string
  /** Aide sous le champ (masquée quand il y a une erreur). */
  hint?: string
  /** Champ de recherche dans la liste (`true` par défaut). */
  searchable?: boolean
  searchPlaceholder?: string
  noResultsText?: string
  /** Bouton « Effacer la sélection » en pied de liste quand une valeur est choisie. */
  clearable?: boolean
}

/** Préfixe des valeurs cmdk : jamais vides, donc jamais confondues avec « pas d'élément surligné ». */
const toItemValue = (value: string) => `option:${value}`

/**
 * Liste déroulante avec recherche (port du Select **maison** du Vue, `components/ui/select`) :
 * popover + command de shadcn. Mêmes props que le Vue ; `value` / `onValueChange` remplacent le
 * v-model. Recherche : sous-chaîne du libellé, insensible à la casse. Fonctionne dans un Dialog
 * sans option (la prop `teleport` du Vue disparaît). Les props natives (`name`, `onBlur`,
 * `aria-*`…) et `ref` vont au bouton déclencheur (pratique avec un `Controller` react-hook-form).
 *
 * Sans besoin de recherche ni d'effacement, le `Select` shadcn suffit.
 *
 * @example
 * <Combobox
 *   label="Véhicule"
 *   required
 *   options={vehicles.map((v) => ({ value: v.id, label: v.immat }))}
 *   value={vehiculeId}
 *   onValueChange={setVehiculeId}
 *   clearable
 * />
 */
export function Combobox({
  value = '',
  onValueChange,
  options,
  label,
  placeholder,
  disabled = false,
  required = false,
  error,
  hint,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  noResultsText = 'Aucun résultat',
  clearable = false,
  id,
  className,
  onKeyDown,
  ...props
}: ComboboxProps) {
  const autoId = useId()
  const triggerId = id ?? `combobox-${autoId}`
  const labelId = `${triggerId}-label`
  const messageId = `${triggerId}-message`

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Élément surligné (navigation clavier) : l'option sélectionnée à l'ouverture.
  const [highlighted, setHighlighted] = useState('')
  const commandRef = useRef<HTMLDivElement>(null)

  const query = search.trim().toLowerCase()
  const filteredOptions =
    searchable && query
      ? options.filter((option) => option.label.toLowerCase().includes(query))
      : options
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  const handleOpenChange = (next: boolean) => {
    if (disabled) return
    setOpen(next)
    if (next) setHighlighted(value ? toItemValue(value) : '')
    else setSearch('')
  }

  const select = (next: string) => {
    onValueChange?.(next)
    handleOpenChange(false)
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      handleOpenChange(true)
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? messageId : undefined}
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors',
              'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50',
              error && 'border-destructive',
              !value && 'text-muted-foreground',
            )}
            {...props}
          >
            <span className="flex-1 truncate text-left">
              {selectedLabel || placeholder || 'Sélectionner...'}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180 text-foreground',
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden p-0 shadow-lg"
          onOpenAutoFocus={(event) => {
            // Sans champ de recherche, le focus va sur la liste pour la navigation au clavier.
            if (!searchable) {
              event.preventDefault()
              commandRef.current?.focus()
            }
          }}
        >
          <Command
            ref={commandRef}
            shouldFilter={false}
            value={highlighted}
            onValueChange={setHighlighted}
            label={searchPlaceholder}
            className="rounded-none bg-popover"
            onKeyDown={(event) => {
              // Comme le Vue : Tab referme la liste (le focus revient sur le déclencheur).
              if (event.key === 'Tab') {
                event.preventDefault()
                handleOpenChange(false)
              }
            }}
          >
            {searchable && (
              <div className="border-b p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <CommandPrimitive.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder={searchPlaceholder}
                    className="h-8 w-full rounded-sm border border-input bg-transparent pr-8 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Effacer la recherche"
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setSearch('')}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <CommandList label={label} className="max-h-60 py-1">
              <CommandEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
                {noResultsText}
              </CommandEmpty>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={toItemValue(option.value)}
                  disabled={option.disabled}
                  onSelect={() => select(option.value)}
                  className={cn(
                    'cursor-pointer rounded-none px-3 py-2 transition-colors',
                    option.value === value && 'font-medium',
                  )}
                >
                  <Check
                    className={cn(
                      'size-3.5 shrink-0 text-current',
                      option.value === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandList>

            {clearable && value && (
              <div className="border-t p-1.5">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  onClick={() => select('')}
                >
                  <X className="size-3.5" />
                  Effacer la sélection
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {error ? (
        <p id={messageId} className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
