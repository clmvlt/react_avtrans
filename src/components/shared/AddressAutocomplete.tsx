import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { LoaderCircle, MapPin, type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'
import type { AddressDTO } from '@/models/AddressDTO'
import { geocodingService } from '@/services/geocoding'
import type { AddressResult } from '@/types/geocoding'

type AddressAutocompleteProps = Omit<
  ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'type'
> & {
  /** Rue saisie (numéro + voie). */
  value?: string
  /** Chaque frappe, et la rue choisie lors d'une sélection. */
  onValueChange?: (value: string) => void
  /** Suggestion choisie : adresse complète (rue, ville, code postal, pays « France »). */
  onSelect?: (address: AddressDTO) => void
  label?: string
  /** Astérisque après le libellé (visuel). */
  required?: boolean
  error?: string
  hint?: string
  /** Icône à gauche du champ (`MapPin` par défaut). */
  icon?: LucideIcon
  /** Nombre maximal de suggestions (8 par défaut). */
  limit?: number
}

const MIN_QUERY_LENGTH = 3

const streetOf = (result: AddressResult) =>
  result.houseNumber ? `${result.houseNumber} ${result.street}` : result.street

/** Suggestions pour le texte tapé : 3 caractères minimum, 250 ms après la dernière frappe. */
function useAddressSuggestions(term: string, limit: number) {
  const trimmed = term.trim()
  const debounced = useDebouncedValue(trimmed, 250)
  const enabled = debounced.length >= MIN_QUERY_LENGTH

  const query = useQuery({
    queryKey: ['geocoding', 'search', debounced, limit],
    queryFn: () => geocodingService.search({ q: debounced, limit }),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const active = trimmed.length >= MIN_QUERY_LENGTH
  return {
    results: active && enabled ? (query.data ?? []) : [],
    loading: active && (trimmed !== debounced || query.isFetching),
  }
}

/**
 * Saisie d'adresse avec suggestions de la Base Adresse Nationale (port d'`AddressAutocomplete.vue`) :
 * recherche à partir de 3 caractères, 250 ms après la dernière frappe (`useQuery` sur
 * `geocodingService.search`, donc sans réponse périmée), ↑ / ↓ / Entrée / Échap.
 * Le libellé est relié au champ ; Échap ferme la liste sans fermer le Dialog qui la contient.
 *
 * La liste est positionnée sous le champ (pas de portail) : dans un Dialog à défilement, elle
 * reste défilable à la molette et au doigt, ce que ne permet pas un Popover portaillé.
 *
 * @example
 * <AddressAutocomplete label="Adresse" value={street} onValueChange={setStreet}
 *   onSelect={(a) => form.reset({ ...form.getValues(), city: a.city, postalCode: a.postalCode })} />
 */
export function AddressAutocomplete({
  value = '',
  onValueChange,
  onSelect,
  label,
  placeholder,
  disabled = false,
  required = false,
  error,
  hint,
  icon: Icon = MapPin,
  limit = 8,
  id,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: AddressAutocompleteProps) {
  const autoId = useId()
  const inputId = id ?? `address-${autoId}`
  const listId = `${inputId}-list`
  const messageId = `${inputId}-message`

  // Texte réellement tapé : une sélection le vide, pour ne pas relancer une recherche sur la rue choisie.
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const { results, loading } = useAddressSuggestions(term, limit)
  const showList = open && results.length > 0

  // Échap ferme la liste avant que le Dialog parent ne le reçoive (Radix écoute en capture sur document).
  useEffect(() => {
    if (!showList) return
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault()
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [showList])

  const select = (result: AddressResult) => {
    const street = streetOf(result)
    onValueChange?.(street)
    onSelect?.({ street, city: result.city, postalCode: result.postcode, country: 'France' })
    setTerm('')
    setOpen(false)
    setHighlighted(-1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (!showList) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((current) => (current + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((current) => (current <= 0 ? results.length - 1 : current - 1))
    } else if (event.key === 'Enter') {
      const choice = results[highlighted]
      if (choice) {
        event.preventDefault()
        select(choice)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium',
            error && 'text-destructive',
            disabled && 'text-muted-foreground',
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Icon
          className={cn(
            'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        />

        <Input
          id={inputId}
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && highlighted >= 0 ? `${listId}-${highlighted}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className="pr-9 pl-9"
          onChange={(event) => {
            onValueChange?.(event.target.value)
            setTerm(event.target.value)
            setOpen(true)
            setHighlighted(-1)
          }}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            onFocus?.(event)
            if (results.length > 0) setOpen(true)
          }}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            onBlur?.(event)
            setOpen(false)
          }}
          onKeyDown={handleKeyDown}
          {...props}
        />

        {loading && (
          <LoaderCircle className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label ?? 'Suggestions d’adresses'}
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
          >
            {results.map((result, index) => (
              <li
                key={`${result.label}-${index}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlighted}
                className={cn(
                  'flex cursor-pointer items-start gap-2 px-3 py-2 text-sm',
                  index === highlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                )}
                // Garde le focus dans le champ (sinon le blur fermerait la liste avant le clic).
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(result)}
                onMouseEnter={() => setHighlighted(index)}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="leading-tight">{result.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p id={messageId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
