import { useState } from 'react'
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
 * Section « Utilisateurs » de l'export : tout (dé)sélectionner, recherche par nom ou e-mail,
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
    <div className="border-b pb-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Utilisateurs</h3>
        <div className="flex items-center gap-2">
          <Button type="button" variant="link" size="sm" disabled={disabled} onClick={selectAll}>
            Tout sélectionner
          </Button>
          <span className="text-muted-foreground">|</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={disabled}
            onClick={() => onChange([])}
          >
            Tout désélectionner
          </Button>
        </div>
      </div>

      <HoursSearchInput
        className="mb-4"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Rechercher par nom ou email..."
        disabled={disabled}
      />

      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge>{count}</Badge>
        <span>
          utilisateur{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-lg border bg-muted/30">
        {filteredUsers.map((user) => {
          const uuid = user.uuid ?? ''
          return (
            <label
              key={uuid}
              className={cn(
                'flex cursor-pointer items-center border-b p-3 transition-colors last:border-b-0 hover:bg-accent',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <Checkbox
                className="mr-3 size-5"
                checked={value.includes(uuid)}
                disabled={disabled}
                onCheckedChange={(checked) => toggle(uuid, checked === true)}
              />
              <div className="flex flex-1 items-center gap-3">
                <UserAvatar user={user} />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                {user.role && (
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: user.role.color }}
                  >
                    {user.role.nom}
                  </span>
                )}
              </div>
            </label>
          )
        })}

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-muted-foreground italic">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <FieldError className="mt-2" errors={error ? [{ message: error }] : undefined} />
    </div>
  )
}
