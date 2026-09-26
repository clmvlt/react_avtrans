import type { DragEvent } from 'react'
import { Folder, FolderOpen, List, Plus } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import { Button } from '@/components/ui/button'
import type { DossierTypeEntretienDTO } from '@/models'
import { UNCLASSIFIED, type FolderSelection } from '../../hooks/useTypesExplorer'
import { DossierActions } from './DossierActions'
import { DossierNavItem } from './DossierNavItem'

type DropTargetProps = {
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
}

type DossiersSidebarProps = {
  dossiers: DossierTypeEntretienDTO[]
  totalCount: number
  unclassifiedCount: number
  countForFolder: (folderId: string) => number
  selectedFolderId: FolderSelection
  onSelectFolder: (folderId: FolderSelection) => void
  dragOverFolderId: string | null
  dropTargetProps: (folderId: string) => DropTargetProps
  /** Création, modification et suppression des dossiers. */
  canManage: boolean
  onCreateFolder: () => void
  onEditFolder: (dossier: DossierTypeEntretienDTO) => void
  onDeleteFolder: (dossier: DossierTypeEntretienDTO) => void
}

/**
 * Barre des dossiers de TypesEntretien.vue : colonne collante de 280 px en desktop, bande
 * horizontale en mobile. Les dossiers et « Non classés » sont des zones de dépôt.
 */
export function DossiersSidebar({
  dossiers,
  totalCount,
  unclassifiedCount,
  countForFolder,
  selectedFolderId,
  onSelectFolder,
  dragOverFolderId,
  dropTargetProps,
  canManage,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}: DossiersSidebarProps) {
  return (
    <aside className="border-b bg-background md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-b-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <BackButton fallback="/entretiens" size="icon" className="size-7" title="Retour" />
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Dossiers
          </h2>
        </div>
        {canManage && (
          <Button
            type="button"
            size="icon-sm"
            title="Créer un dossier"
            aria-label="Créer un dossier"
            onClick={onCreateFolder}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 overflow-y-auto p-2 md:flex-col md:flex-nowrap md:gap-0">
        <DossierNavItem
          icon={List}
          iconClassName="text-primary"
          label="Tous"
          count={totalCount}
          selected={selectedFolderId === null}
          onSelect={() => onSelectFolder(null)}
          className="mb-2"
        />

        {dossiers.map((dossier, index) => {
          const id = dossier.id ?? ''
          const selected = selectedFolderId === id
          return (
            <DossierNavItem
              key={dossier.id ?? index}
              icon={Folder}
              iconClassName="text-amber-500"
              label={dossier.nom ?? ''}
              count={countForFolder(id)}
              selected={selected}
              dragOver={dragOverFolderId === id}
              onSelect={() => onSelectFolder(id)}
              hideCountOnHover
              className="md:mb-1"
              actions={
                canManage && (
                  <DossierActions
                    selected={selected}
                    onEdit={() => onEditFolder(dossier)}
                    onDelete={() => onDeleteFolder(dossier)}
                  />
                )
              }
              {...dropTargetProps(id)}
            />
          )
        })}

        <DossierNavItem
          icon={FolderOpen}
          iconClassName="text-muted-foreground"
          label="Non classés"
          count={unclassifiedCount}
          selected={selectedFolderId === UNCLASSIFIED}
          dragOver={dragOverFolderId === UNCLASSIFIED}
          onSelect={() => onSelectFolder(UNCLASSIFIED)}
          className="mt-0 border-t pt-3 md:mt-2"
          {...dropTargetProps(UNCLASSIFIED)}
        />
      </div>
    </aside>
  )
}
