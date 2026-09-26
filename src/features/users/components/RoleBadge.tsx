import type { RoleDTO } from '@/models'

type RoleBadgeProps = {
  role?: RoleDTO
  /** Affiche « Aucun rôle » en italique quand le rôle manque (tableau desktop) ; rien sinon. */
  showEmpty?: boolean
}

/** Pastille du rôle, sur la couleur du rôle renvoyée par l'API. */
export function RoleBadge({ role, showEmpty = false }: RoleBadgeProps) {
  if (!role) {
    return showEmpty ? (
      <span className="text-xs text-muted-foreground italic">Aucun rôle</span>
    ) : null
  }

  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: role.color }}
    >
      {role.nom}
    </span>
  )
}
