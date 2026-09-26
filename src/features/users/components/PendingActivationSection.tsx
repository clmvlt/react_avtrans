import { CircleCheck, LoaderCircle, UserPlus } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { UserDTO } from '@/models'
import { formatCreatedAt } from '../lib/formatters'

type PendingActivationSectionProps = {
  users: UserDTO[]
  /** Compte en cours d'activation (bouton désactivé avec spinner) */
  activatingUuid: string | null
  onActivate: (user: UserDTO) => void
}

/** Encadré des comptes créés il y a moins de 7 jours et pas encore activés. */
export function PendingActivationSection({
  users,
  activatingUuid,
  onActivate,
}: PendingActivationSectionProps) {
  if (users.length === 0) return null

  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="mb-1 flex items-center gap-2">
        <UserPlus className="size-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          {users.length} {users.length > 1 ? 'comptes créés récemment' : 'compte créé récemment'} en
          attente d'activation
        </h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Ces comptes ont été créés il y a moins de 7 jours et doivent être activés pour accéder à
        l'application.
      </p>
      <ul className="space-y-2">
        {users.map((user) => {
          const createdAt = formatCreatedAt(user.createdAt)
          const activating = activatingUuid === user.uuid
          return (
            <li
              key={user.uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar user={user} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  {createdAt && (
                    <span className="text-xs text-muted-foreground">Créé le {createdAt}</span>
                  )}
                </div>
              </div>
              <Button size="sm" disabled={activating} onClick={() => onActivate(user)}>
                {activating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CircleCheck className="size-4" />
                )}
                Activer
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
