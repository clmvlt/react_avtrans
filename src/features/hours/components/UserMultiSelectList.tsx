import { useId, useState } from 'react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { UserDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'
import { HoursSearchInput } from './HoursSearchInput'

type UserMultiSelectListProps = {
  /** Liste complète de GET /users (masqués compris : filtrés ici). */
  users: UserDTO[]
  /** UUID sélectionnés. */
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  error?: string
}

/**
 * Carte « Employés » de l'export : tout (dé)sélectionner, recherche par nom ou e-mail,
 * compteur et liste à cocher. Seuls les utilisateurs visibles sont proposés (`selectableUsers`,
 * la sélection courante étant conservée). « Tout sélectionner » remplace la sélection par la
 * liste filtrée, comme le Vue.
 */
export function UserMultiSelectList({
  users,
  value,
  onChange,
  disabled = false,
  error,
}: UserMultiSelectListProps) {
  const titleId = useId()
  const [search, setSearch] = useState('')

  const visibleUsers = selectableUsers(users, value)
  const query = search.toLowerCase()
  const filteredUsers = search.trim()
    ? visibleUsers.filter((user) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
        const email = (user.email || '').toLowerCase()
        return fullName.includes(query) || email.includes(query)
      })
    : visibleUsers

  const selectAll = () =>
    onChange(
      filteredUsers.map((user) => user.uuid).filter((uuid): uuid is string => uuid !== undefined),
    )

  const toggle = (uuid: string, checked: boolean) =>
    onChange(checked ? [...value, uuid] : value.filter((selected) => selected !== uuid))

  const count = value.length

  return (
    <section aria-labelledby={titleId} className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            Employés
          </h2>
          <Badge variant={count > 0 ? 'default' : 'secondary'}>
            {count} sélectionné{count > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={selectAll}>
            Tout sélectionner
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange([])}
          >
            Tout désélectionner
          </Button>
        </div>
      </div>

      <HoursSearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Rechercher par nom ou email..."
        aria-label="Rechercher un employé par nom ou email"
        disabled={disabled}
      />

      <div className="max-h-[400px] overflow-y-auto rounded-lg border">
        {filteredUsers.map((user) => {
          const uuid = user.uuid ?? ''
          return (
            <label
              key={uuid}
              className={cn(
                'flex cursor-pointer items-center gap-3 border-b p-3 transition-colors last:border-b-0 hover:bg-accent/50 has-[[data-state=checked]]:bg-primary/5',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <Checkbox
                className="size-5"
                checked={value.includes(uuid)}
                disabled={disabled}
                onCheckedChange={(checked) => toggle(uuid, checked === true)}
              />
              <UserAvatar user={user} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </div>
                <div className="truncate text-sm text-muted-foreground">{user.email}</div>
              </div>
              {user.role && (
                <span
                  className="inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium text-white max-sm:hidden"
                  style={{ backgroundColor: user.role.color }}
                >
                  {user.role.nom}
                </span>
              )}
            </label>
          )
        })}

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <FieldError errors={error ? [{ message: error }] : undefined} />
    </section>
  )
}
