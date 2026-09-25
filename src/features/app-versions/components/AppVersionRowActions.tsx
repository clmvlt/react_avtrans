import { Download, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppVersionDTO } from '@/models'
import { appVersionsService } from '@/services'

type AppVersionRowActionsProps = {
  version: AppVersionDTO
  onEdit: (version: AppVersionDTO) => void
  onDelete: (version: AppVersionDTO) => void
}

/**
 * Boutons d'une ligne : télécharger, modifier, supprimer (libellés à partir de `sm`).
 * Le lien de téléchargement est le bouton lui-même (le Vue imbriquait un `<button>` dans un `<a>`).
 * L'API est sur une autre origine : `download` est ignoré et l'onglet suit le fichier (8.3).
 */
export function AppVersionRowActions({ version, onEdit, onDelete }: AppVersionRowActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button asChild variant="outline" size="icon-sm" title="Télécharger">
        <a href={appVersionsService.getDownloadUrl(version.id)} download>
          <Download className="size-3.5" />
          <span className="sr-only">Télécharger</span>
        </a>
      </Button>
      <Button
        variant="default"
        size="icon-sm"
        className="sm:size-auto sm:px-3"
        onClick={() => onEdit(version)}
        title="Modifier"
      >
        <Pencil className="size-3.5 sm:hidden" />
        <span className="max-sm:sr-only">Modifier</span>
      </Button>
      <Button
        variant="destructive"
        size="icon-sm"
        className="sm:size-auto sm:px-3"
        onClick={() => onDelete(version)}
        title="Supprimer"
      >
        <Trash2 className="size-3.5 sm:hidden" />
        <span className="max-sm:sr-only">Supprimer</span>
      </Button>
    </div>
  )
}
