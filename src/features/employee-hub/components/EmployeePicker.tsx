import { useState } from 'react'
import { Check, ChevronsUpDown, UserRoundSearch } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDayKey } from '@/hooks/useDayChange'
import { cn } from '@/lib/utils'
import { usePickerShortcut } from '../hooks/usePickerShortcut'
import { groupDirectory, normalizeSearch, type DirectoryEntry } from '../lib/employeeDirectory'
import { describePresence, PRESENCE_DOT_CLASSES, PRESENCE_TEXT_CLASSES } from '../lib/presence'
import { EmployeeAvatar } from './EmployeeAvatar'

type EmployeePickerProps = {
  entries: DirectoryEntry[]
  /** Employé affiché, `null` tant qu'aucun n'est choisi */
  selected: DirectoryEntry | null
  onSelect: (userUuid: string) => void
  disabled?: boolean
  className?: string
}

/** Recherche de cmdk : prénom, nom et e-mail, sans tenir compte des accents. */
const filterItem = (_value: string, search: string, keywords?: string[]) =>
  normalizeSearch((keywords ?? []).join(' ')).includes(normalizeSearch(search)) ? 1 : 0

/**
 * Choix de l'employé, en haut à gauche de la fiche : gros bouton avec sa photo, son nom et sa
 * présence, qui ouvre une liste avec recherche groupée par présence. Ctrl + K l'ouvre aussi.
 */
export function EmployeePicker({
  entries,
  selected,
  onSelect,
  disabled,
  className,
}: EmployeePickerProps) {
  const [open, setOpen] = useState(false)
  const todayKey = useDayKey()
  usePickerShortcut(() => {
    if (!disabled) setOpen(true)
  })

  const groups = groupDirectory(entries)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={selected ? `Changer d'employé (${selected.fullName})` : 'Choisir un employé'}
          className={cn(
            'group flex max-w-full min-w-0 items-center gap-3 rounded-xl border bg-card py-2 pr-3 pl-2 text-left shadow-xs transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60 data-[state=open]:border-primary/40 data-[state=open]:bg-accent/50 sm:pr-4',
            className,
          )}
        >
          {selected ? (
            <EmployeeAvatar user={selected.user} presence={selected.presence} size="lg" />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRoundSearch className="size-6" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lg leading-tight font-semibold text-foreground">
              {selected ? selected.fullName : 'Choisir un employé'}
            </span>
            <span
              className={cn(
                'block truncate text-sm',
                selected ? PRESENCE_TEXT_CLASSES[selected.presence] : 'text-muted-foreground',
              )}
            >
              {selected
                ? describePresence(selected.presence, selected.status, todayKey)
                : 'Rechercher par nom'}
            </span>
          </span>
          <kbd className="pointer-events-none hidden h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
            Ctrl K
          </kbd>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <Command filter={filterItem}>
          <CommandInput placeholder="Rechercher un employé..." />
          <CommandList className="max-h-[min(26rem,60dvh)]">
            <CommandEmpty>Aucun employé trouvé</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup
                key={group.presence}
                heading={`${group.label} (${group.entries.length})`}
              >
                {group.entries.map((entry) => {
                  const uuid = entry.user.uuid ?? ''
                  const isSelected = uuid === selected?.user.uuid
                  return (
                    <CommandItem
                      key={uuid}
                      value={uuid}
                      keywords={[
                        entry.fullName,
                        `${entry.user.lastName ?? ''} ${entry.user.firstName ?? ''}`,
                        entry.user.email ?? '',
                      ]}
                      onSelect={() => {
                        setOpen(false)
                        if (!isSelected) onSelect(uuid)
                      }}
                      className="gap-3 py-2"
                    >
                      <UserAvatar user={entry.user} size="sm" />
                      <span className="min-w-0 flex-1 truncate">{entry.fullName}</span>
                      <span
                        aria-hidden
                        className={cn('size-2 rounded-full', PRESENCE_DOT_CLASSES[entry.presence])}
                      />
                      <Check className={cn('size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
