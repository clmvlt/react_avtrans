import { useId, useRef, useState } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { ArrowLeft, ChevronDown, ChevronRight, Folder, Search, Wrench, X } from 'lucide-react'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'
import { cn } from '@/lib/utils'

type TypeEntretienPickerProps = {
  dossiers: DossierTypeEntretienDTO[]
  types: TypeEntretienDTO[]
  /** Dossier ouvert dans le sélecteur (fait partie du formulaire, comme dans le Vue). */
  dossierId: string
  typeEntretienId: string
  /** Choix d'un dossier, ou `''` avec « Retour » : le formulaire vide alors le type. */
  onDossierChange: (dossierId: string) => void
  onTypeChange: (typeEntretienId: string) => void
}

const matches = (label: string, query: string) => label.toLowerCase().includes(query)

/**
 * Sélecteur hiérarchique « Dossier › Type » du formulaire d'Entretiens.vue (liste téléportée dans
 * le Vue) : d'abord les dossiers, puis les types du dossier choisi, avec « Retour » et recherche.
 * Popover + command de shadcn : navigation au clavier en plus.
 */
export function TypeEntretienPicker({
  dossiers,
  types,
  dossierId,
  typeEntretienId,
  onDossierChange,
  onTypeChange,
}: TypeEntretienPickerProps) {
  const triggerId = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const query = search.trim().toLowerCase()
  const dossierOptions = dossiers
    .filter((d) => d.id && d.nom)
    .map((d) => ({ value: d.id!, label: d.nom! }))
  const typeOptions = dossierId
    ? types
        .filter((t) => t.id && t.nom && t.dossier?.id === dossierId)
        .map((t) => ({ value: t.id!, label: t.nom! }))
    : []
  const visibleDossiers = query
    ? dossierOptions.filter((d) => matches(d.label, query))
    : dossierOptions
  const visibleTypes = query ? typeOptions.filter((t) => matches(t.label, query)) : typeOptions

  const selectedDossierLabel = dossiers.find((d) => d.id === dossierId)?.nom || ''
  const selectedTypeLabel = types.find((t) => t.id === typeEntretienId)?.nom || ''

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    setSearch('')
  }

  const changeDossier = (id: string) => {
    onDossierChange(id)
    setSearch('')
    inputRef.current?.focus()
  }

  const selectType = (id: string) => {
    onTypeChange(id)
    handleOpenChange(false)
  }

  return (
    <div className="relative">
      <label htmlFor={triggerId} className="mb-2 block text-sm font-medium text-foreground">
        Type d&apos;entretien
        <span className="ml-1 text-destructive">*</span>
      </label>

      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50',
              !typeEntretienId && 'text-muted-foreground',
            )}
          >
            <span className="flex-1 truncate text-left">
              {typeEntretienId && selectedTypeLabel ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{selectedDossierLabel}</span>
                  <ChevronRight className="size-3 text-muted-foreground" />
                  <span className="text-foreground">{selectedTypeLabel}</span>
                </span>
              ) : (
                "Sélectionner un type d'entretien"
              )}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden p-0 shadow-lg"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <Command shouldFilter={false} className="rounded-none bg-popover">
            {dossierId && (
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => changeDossier('')}
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Retour</span>
                </button>
                <span className="text-sm font-medium text-foreground">{selectedDossierLabel}</span>
              </div>
            )}

            <div className="border-b p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <CommandPrimitive.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={dossierId ? 'Rechercher un type...' : 'Rechercher un dossier...'}
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

            <CommandList className="max-h-60 py-1">
              <CommandEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
                {dossierId ? 'Aucun type trouvé' : 'Aucun dossier trouvé'}
              </CommandEmpty>
              {dossierId
                ? visibleTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={`type:${type.value}`}
                      onSelect={() => selectType(type.value)}
                      className="cursor-pointer gap-2 rounded-none px-3 py-2 transition-colors"
                    >
                      <Wrench className="size-4 text-primary" />
                      <span className="flex-1">{type.label}</span>
                    </CommandItem>
                  ))
                : visibleDossiers.map((dossier) => (
                    <CommandItem
                      key={dossier.value}
                      value={`dossier:${dossier.value}`}
                      onSelect={() => changeDossier(dossier.value)}
                      className="cursor-pointer gap-2 rounded-none px-3 py-2 transition-colors"
                    >
                      <Folder className="size-4 text-amber-500" />
                      <span className="flex-1">{dossier.label}</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </CommandItem>
                  ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
