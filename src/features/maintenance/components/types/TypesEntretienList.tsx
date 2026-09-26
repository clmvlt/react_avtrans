import type { DragEvent } from 'react'
import { FolderOpen } from 'lucide-react'
import type { TypeEntretienDTO } from '@/models'
import { UNCLASSIFIED, type FolderSelection } from '../../hooks/useTypesExplorer'
import { EmptyBlock } from '../EmptyBlock'
import { TypeEntretienCard } from './TypeEntretienCard'

type DragSourceProps = {
  onDragStart: (event: DragEvent) => void
  onDragEnd: () => void
}

type TypesEntretienListProps = {
  /** Types du dossier affiché, filtrés par la recherche. */
  types: TypeEntretienDTO[]
  selectedFolderId: FolderSelection
  /** Texte de recherche (message de l'état vide). */
  search: string
  canManage: boolean
  dragSourceProps: (type: TypeEntretienDTO) => DragSourceProps
  onEdit: (type: TypeEntretienDTO) => void
  onDelete: (type: TypeEntretienDTO) => void
}

/** Message de l'état vide, selon la recherche puis le dossier affiché (TypesEntretien.vue). */
function emptyMessage(search: string, selectedFolderId: FolderSelection) {
  if (search) return `Aucun type trouvé pour "${search}"`
  if (selectedFolderId === UNCLASSIFIED) return 'Aucun type non classé'
  if (selectedFolderId) return 'Ce dossier est vide'
  return "Aucun type d'entretien"
}

/**
 * Liste des types d'entretien du dossier affiché. Le badge du dossier n'apparaît que dans la vue
 * « Tous ».
 */
export function TypesEntretienList({
  types,
  selectedFolderId,
  search,
  canManage,
  dragSourceProps,
  onEdit,
  onDelete,
}: TypesEntretienListProps) {
  return (
    <div className="flex flex-col gap-3">
      {types.map((type, index) => (
        <TypeEntretienCard
          key={type.id ?? index}
          type={type}
          showFolder={selectedFolderId === null}
          canManage={canManage}
          dragSourceProps={dragSourceProps(type)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {types.length === 0 && (
        <EmptyBlock icon={FolderOpen} iconClassName="opacity-50">
          <p className="text-muted-foreground">{emptyMessage(search, selectedFolderId)}</p>
        </EmptyBlock>
      )}
    </div>
  )
}
