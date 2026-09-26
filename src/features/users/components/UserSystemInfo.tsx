import { CircleCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserDTO } from '@/models'
import { formatSystemDate } from '../lib/formatters'

type UserSystemInfoProps = {
  user: UserDTO
}

/** Bloc « Informations système » du dialog d'édition : e-mail vérifié, UUID, dates. */
export function UserSystemInfo({ user }: UserSystemInfoProps) {
  return (
    <div className="rounded-md border border-border bg-muted p-4">
      <h4 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Informations système
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Email vérifié</span>
          <span
            className={cn(
              'inline-flex w-fit items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium',
              user.isMailVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            )}
          >
            {user.isMailVerified ? (
              <CircleCheck className="size-3" />
            ) : (
              <Clock className="size-3" />
            )}
            {user.isMailVerified ? 'Vérifié' : 'Non vérifié'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">UUID</span>
          <span className="font-mono text-xs break-all text-muted-foreground">{user.uuid}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Créé le</span>
          <span className="text-sm font-medium text-foreground">
            {formatSystemDate(user.createdAt)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Modifié le</span>
          <span className="text-sm font-medium text-foreground">
            {formatSystemDate(user.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
