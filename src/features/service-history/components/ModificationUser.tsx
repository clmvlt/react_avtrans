import { UserX } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { UserDTO } from '@/models'

type ModificationUserProps = {
  user: UserDTO | null | undefined
  /** Libellé affiché si l'utilisateur est null (compte supprimé) */
  missingLabel?: string
  size?: 'sm' | 'md'
}

/**
 * Avatar + nom complet d'un utilisateur de l'historique (employé concerné ou administrateur
 * auteur). Réutilisé par le journal des pointages.
 */
export function ModificationUser({
  user,
  missingLabel = 'Utilisateur supprimé',
  size = 'sm',
}: ModificationUserProps) {
  const avatarSize = size === 'md' ? 'size-8' : 'size-6'

  if (!user) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground',
            avatarSize,
          )}
        >
          <UserX className="size-3.5" />
        </span>
        <span className="truncate text-sm text-muted-foreground italic">{missingLabel}</span>
      </span>
    )
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const initials =
    ((user.firstName?.charAt(0) ?? '') + (user.lastName?.charAt(0) ?? '')).toUpperCase() || '?'

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar className={avatarSize}>
        {user.pictureUrl && (
          <AvatarImage src={user.pictureUrl} alt={fullName} className="object-cover" />
        )}
        <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm font-medium text-foreground">{fullName || '—'}</span>
    </span>
  )
}
