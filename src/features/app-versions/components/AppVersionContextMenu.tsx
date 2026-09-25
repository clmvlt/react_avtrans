import type { ReactElement } from 'react'
import { Download, Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { AppVersionDTO } from '@/models'
import { appVersionsService } from '@/services'

type AppVersionContextMenuProps = {
  version: AppVersionDTO
  /** Ligne du tableau qui ouvre le menu au clic droit */
  children: ReactElement
  onEdit: (version: AppVersionDTO) => void
  onDelete: (version: AppVersionDTO) => void
}

/** Menu du clic droit sur une version : télécharger, modifier, supprimer. */
export function AppVersionContextMenu({
  version,
  children,
  onEdit,
  onDelete,
}: AppVersionContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-48">
        <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
          {version.versionName}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => window.location.assign(appVersionsService.getDownloadUrl(version.id))}
        >
          <Download />
          Télécharger
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onEdit(version)}>
          <Pencil />
          Modifier
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => onDelete(version)}>
          <Trash2 />
          Supprimer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
