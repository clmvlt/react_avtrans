import type { ReactElement } from 'react'
import { FolderOpen, Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  getEntretienFileCount,
  type EntretienRow,
  type EntretienRowActions,
} from '../../lib/entretienRow'

type EntretienContextMenuProps = EntretienRowActions & {
  entretien: EntretienRow
  canManage: boolean
  /** Ligne `<tr>` de la table. */
  children: ReactElement
}

/**
 * Menu du clic droit sur une ligne de l'historique (/entretiens) : titre = immatriculation,
 * « Voir fichiers (n) », puis « Modifier » / « Supprimer » avec les droits de gestion. Comme le
 * Vue, le menu s'ouvre même sans entrée (titre seul) et remplace alors le menu du navigateur.
 */
export function EntretienContextMenu({
  entretien,
  canManage,
  onOpenFiles,
  onEdit,
  onDelete,
  children,
}: EntretienContextMenuProps) {
  const fileCount = getEntretienFileCount(entretien)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      {/* Le menu est dans un portail : sans stopPropagation, le clic d'une entrée remonterait
          (arbre React) jusqu'à la ligne et ouvrirait aussi la modification. */}
      <ContextMenuContent className="min-w-48" onClick={(event) => event.stopPropagation()}>
        {entretien.vehiculeImmat && (
          <>
            <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
              {entretien.vehiculeImmat}
            </ContextMenuLabel>
            <ContextMenuSeparator />
          </>
        )}
        {fileCount > 0 && (
          <ContextMenuItem onSelect={() => onOpenFiles(entretien)}>
            <FolderOpen className="size-4" />
            Voir fichiers ({fileCount})
          </ContextMenuItem>
        )}
        {canManage && (
          <>
            {fileCount > 0 && <ContextMenuSeparator />}
            <ContextMenuItem onSelect={() => onEdit(entretien)}>
              <Pencil className="size-4" />
              Modifier
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={() => onDelete(entretien)}>
              <Trash2 className="size-4" />
              Supprimer
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
