import type { DragEvent } from 'react'
import { Folder, FolderOpen, List } from 'lucide-react'
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
  /** Modification et suppression des dossiers (la création est dans l'en-tête de la page). */
  canManage: boolean
  onEditFolder: (dossier: DossierTypeEntretienDTO) => void
  onDeleteFolder: (dossier: DossierTypeEntretienDTO) => void
}

/**
 * Panneau des dossiers de TypesEntretien.vue : carte collante à gauche en desktop (liste qui
 * défile si besoin), rangée qui défile horizontalement en mobile. Les dossiers et « Non classés »
 * sont des zones de dépôt.
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
  onEditFolder,
  onDeleteFolder,
}: DossiersSidebarProps) {
  return (
    <aside className="rounded-xl border bg-card md:sticky md:top-20 md:flex md:max-h-[calc(100dvh-6.5rem)] md:flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Dossiers</h2>
      </div>

      {/* Téléphone : rangée qui défile horizontalement ; ordinateur : liste verticale */}
      <div className="flex min-h-0 gap-2 overflow-x-auto p-2 md:flex-col md:gap-0 md:overflow-x-visible md:overflow-y-auto">
        <DossierNavItem
          icon={List}
          iconClassName="text-primary"
          label="Tous"
          count={totalCount}
          selected={selectedFolderId === null}
          onSelect={() => onSelectFolder(null)}
          className="md:mb-2"
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
          className="md:mt-2 md:rounded-none md:border-t md:pt-3"
          {...dropTargetProps(UNCLASSIFIED)}
        />
      </div>
    </aside>
  )
}
