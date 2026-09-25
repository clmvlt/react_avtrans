import { cn } from '@/lib/utils'
import type { RoleDTO } from '@/models'

type RoleBadgeProps = {
  role?: RoleDTO
  className?: string
}

/**
 * Pastille du rôle, sur la couleur du rôle.
 * Bug B-23 du Vue reproduit (MIGRATION.md 8.2) : sans couleur de rôle, le repli
 * `hsl(var(--primary))` est invalide (tokens oklch) ; le fond reste transparent et le texte blanc
 * est invisible.
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
        className,
      )}
      style={{ backgroundColor: role?.color || 'hsl(var(--primary))' }}
    >
      {role?.nom || 'Non défini'}
    </span>
  )
}
