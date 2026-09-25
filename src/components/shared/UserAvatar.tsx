import type { ComponentProps } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, type InitialsSource } from '@/lib/userInitials'
import { cn } from '@/lib/utils'

/** Tailles relevées dans le Vue : conteneur, puis texte des initiales. */
const SIZES = {
  /** 32 px (listes compactes) */
  sm: ['size-8', 'text-xs'],
  /** 36 px avec bordure (planning) */
  md: ['size-9 border-2 border-border', 'text-xs'],
  /** 40 px : listes et tables (le plus courant) */
  default: ['size-10', 'text-sm'],
  /** 48 px (cartes mobiles des comptes) */
  lg: ['size-12', 'text-sm'],
  /** 56 px avec bordure (en-tête des dialogs de détail et de suppression) */
  xl: ['size-14 border-2 border-border', 'text-lg'],
} as const

export type UserAvatarSize = keyof typeof SIZES

type UserAvatarProps = Omit<ComponentProps<typeof Avatar>, 'size'> & {
  /** Personne affichée (UserDTO ou `user` imbriqué d'une absence, d'un acompte…). */
  user: (InitialsSource & { pictureUrl?: string | null }) | null | undefined
  /** `sm` 32 px, `md` 36 px, `default` 40 px, `lg` 48 px, `xl` 56 px. */
  size?: UserAvatarSize
}

/**
 * Photo de l'utilisateur, ou ses initiales sur fond violet (le bloc recopié dans une quinzaine de
 * fichiers Vue). Si l'image ne se charge pas, les initiales s'affichent.
 *
 * @example <UserAvatar user={absence.user} size="xl" />
 */
export function UserAvatar({ user, size = 'default', className, ...props }: UserAvatarProps) {
  const [rootClass, textClass] = SIZES[size]

  return (
    <Avatar className={cn('shrink-0 bg-muted', rootClass, className)} {...props}>
      {user?.pictureUrl && (
        <AvatarImage
          src={user.pictureUrl}
          alt={`Photo de ${user.firstName ?? ''}`.trim()}
          className="object-cover"
        />
      )}
      <AvatarFallback
        // Avec une photo, les initiales n'apparaissent que si elle tarde ou échoue (pas de flash).
        delayMs={user?.pictureUrl ? 600 : undefined}
        className={cn('bg-primary font-semibold text-primary-foreground', textClass)}
      >
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  )
}
