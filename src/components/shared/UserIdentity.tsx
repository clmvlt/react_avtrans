import type { ComponentProps, ReactNode } from 'react'
import { UserAvatar, type UserAvatarSize } from '@/components/shared/UserAvatar'
import { cn } from '@/lib/utils'

type UserIdentityProps = ComponentProps<'div'> & {
  /** Personne affichée (UserDTO ou `user` imbriqué). */
  user:
    | {
        firstName?: string | null
        lastName?: string | null
        email?: string | null
        pictureUrl?: string | null
      }
    | null
    | undefined
  /** Taille de l'avatar (`default` = 40 px ; `xl` = 56 px, nom en gras, comme les dialogs Vue). */
  size?: UserAvatarSize
  /** Affiche l'e-mail sous le nom (`true` par défaut). */
  showEmail?: boolean
  /** Lignes supplémentaires sous le nom et l'e-mail (badge de présence, téléphones…). */
  children?: ReactNode
}

/**
 * Avatar + « Prénom Nom » + e-mail : le bloc utilisateur des listes et dialogs du Vue
 * (Users, Heures, Absences, Acomptes, Couchettes, dialogs de détail et de suppression…).
 *
 * @example
 * <UserIdentity user={item.user} />
 * <UserIdentity user={absence.user} size="xl" />
 */
export function UserIdentity({
  user,
  size = 'default',
  showEmail = true,
  children,
  className,
  ...props
}: UserIdentityProps) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const large = size === 'xl'

  return (
    <div
      className={cn('flex min-w-0 items-center', large ? 'gap-4' : 'gap-3', className)}
      {...props}
    >
      <UserAvatar user={user} size={size} />
      <div className={cn('flex min-w-0 flex-col', large && 'gap-1')}>
        {large ? (
          <strong className="truncate text-foreground">{fullName}</strong>
        ) : (
          <span className="truncate font-medium text-foreground">{fullName}</span>
        )}
        {showEmail && user?.email && (
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        )}
        {children}
      </div>
    </div>
  )
}
