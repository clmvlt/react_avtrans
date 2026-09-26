import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import type { CarteDTO } from '@/models'
import type { RevealedSecrets } from '../hooks/useRevealedSecrets'

type CarteRowContextMenuProps = {
  carte: CarteDTO
  secrets: RevealedSecrets
  onEdit: (carte: CarteDTO) => void
  onDelete: (carte: CarteDTO) => void
}

/** Menu du clic droit sur une ligne de la table des cartes (desktop). */
export function CarteRowContextMenu({
  carte,
  secrets,
  onEdit,
  onDelete,
}: CarteRowContextMenuProps) {
  const numeroRevealed = secrets.isNumeroRevealed(carte.uuid)
  const codeRevealed = secrets.isCodeRevealed(carte.uuid)

  return (
    <ContextMenuContent className="min-w-48">
      {carte.nom && (
        <>
          <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
            {carte.nom}
          </ContextMenuLabel>
          <ContextMenuSeparator />
        </>
      )}
      <ContextMenuItem onSelect={() => secrets.toggleNumero(carte.uuid)}>
        {numeroRevealed ? <EyeOff /> : <Eye />}
        {numeroRevealed ? 'Masquer le numéro' : 'Afficher le numéro'}
      </ContextMenuItem>
      {carte.code && (
        <ContextMenuItem onSelect={() => secrets.toggleCode(carte.uuid)}>
          {codeRevealed ? <EyeOff /> : <Eye />}
          {codeRevealed ? 'Masquer le code' : 'Afficher le code'}
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => onEdit(carte)}>
        <Pencil />
        Modifier
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onSelect={() => onDelete(carte)}>
        <Trash2 />
        Supprimer
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
