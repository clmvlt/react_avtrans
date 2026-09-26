import { ErrorState } from '@/components/shared/ErrorState'
import { useDossiersQuery } from '@/features/maintenance/api/useDossiersQuery'
import { useTypesEntretienQuery } from '@/features/maintenance/api/useTypesEntretienQuery'
import { DossierDeleteDialog } from '@/features/maintenance/components/types/DossierDeleteDialog'
import { DossierFormDialog } from '@/features/maintenance/components/types/DossierFormDialog'
import { DossiersSidebar } from '@/features/maintenance/components/types/DossiersSidebar'
import { TypeEntretienDeleteDialog } from '@/features/maintenance/components/types/TypeEntretienDeleteDialog'
import { TypeEntretienFormDialog } from '@/features/maintenance/components/types/TypeEntretienFormDialog'
import { TypesEntretienList } from '@/features/maintenance/components/types/TypesEntretienList'
import { TypesEntretienSkeleton } from '@/features/maintenance/components/types/TypesEntretienSkeleton'
import { TypesToolbar } from '@/features/maintenance/components/types/TypesToolbar'
import { useCanManageMaintenance } from '@/features/maintenance/hooks/useCanManageMaintenance'
import { useTypeDragAndDrop } from '@/features/maintenance/hooks/useTypeDragAndDrop'
import { UNCLASSIFIED, useTypesExplorer } from '@/features/maintenance/hooks/useTypesExplorer'
import { useDialogState } from '@/hooks/useDialogState'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'

/**
 * /types-entretien (TypesEntretien.vue) : dossiers à gauche (zones de dépôt), types du dossier
 * affiché à droite. Création, modification, suppression et glisser-déposer pour l'administrateur
 * et le mécanicien. Accessible seulement depuis le bouton de /entretiens.
 */
export default function TypesEntretienPage() {
  const canManage = useCanManageMaintenance()
  const typesQuery = useTypesEntretienQuery()
  // Comme le Vue, une erreur de chargement des dossiers n'est pas affichée (liste vide).
  const dossiersQuery = useDossiersQuery()
  const types = typesQuery.data ?? []
  const dossiers = dossiersQuery.data ?? []

  const explorer = useTypesExplorer(types)
  const dragAndDrop = useTypeDragAndDrop(dossiers)
  const typeDialogs = useDialogState<'form' | 'delete', TypeEntretienDTO>()
  const dossierDialogs = useDialogState<'form' | 'delete', DossierTypeEntretienDTO>()

  const { selectedFolderId } = explorer
  // À la création, le type est rangé dans le dossier affiché (sauf « Tous » et « Non classés »)
  const defaultDossierId =
    selectedFolderId && selectedFolderId !== UNCLASSIFIED ? selectedFolderId : ''

  const renderContent = () => {
    if (typesQuery.isPending || dossiersQuery.isPending) return <TypesEntretienSkeleton />

    if (typesQuery.isError) {
      return (
        <ErrorState
          className="m-4 w-auto"
          message={
            (typesQuery.error instanceof Error && typesQuery.error.message) ||
            'Erreur lors du chargement'
          }
          onRetry={() => void typesQuery.refetch()}
          isRetrying={typesQuery.isRefetching}
        />
      )
    }

    return (
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 md:grid-cols-[280px_1fr]">
        <DossiersSidebar
          dossiers={dossiers}
          totalCount={types.length}
          unclassifiedCount={explorer.unclassifiedCount}
          countForFolder={explorer.countForFolder}
          selectedFolderId={selectedFolderId}
          onSelectFolder={explorer.selectFolder}
          dragOverFolderId={dragAndDrop.dragOverFolderId}
          dropTargetProps={dragAndDrop.dropTargetProps}
          canManage={canManage}
          onCreateFolder={() => dossierDialogs.open('form')}
          onEditFolder={(dossier) => dossierDialogs.open('form', dossier)}
          onDeleteFolder={(dossier) => dossierDialogs.open('delete', dossier)}
        />

        <div className="flex flex-col gap-4 p-4 md:p-6">
          <TypesToolbar
            search={explorer.search}
            onSearchChange={explorer.setSearch}
            showDragHint={explorer.filteredTypes.length > 0}
            canManage={canManage}
            onCreateType={() => typeDialogs.open('form')}
          />
          <TypesEntretienList
            types={explorer.filteredTypes}
            selectedFolderId={selectedFolderId}
            search={explorer.search}
            canManage={canManage}
            dragSourceProps={dragAndDrop.dragSourceProps}
            onEdit={(type) => typeDialogs.open('form', type)}
            onDelete={(type) => typeDialogs.open('delete', type)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{renderContent()}</main>

      <TypeEntretienFormDialog
        open={typeDialogs.isOpen('form')}
        onOpenChange={typeDialogs.onOpenChange}
        type={typeDialogs.type === 'form' ? typeDialogs.item : null}
        defaultDossierId={defaultDossierId}
        dossiers={dossiers}
      />

      <TypeEntretienDeleteDialog
        open={typeDialogs.isOpen('delete')}
        onOpenChange={typeDialogs.onOpenChange}
        type={typeDialogs.type === 'delete' ? typeDialogs.item : null}
      />

      <DossierFormDialog
        open={dossierDialogs.isOpen('form')}
        onOpenChange={dossierDialogs.onOpenChange}
        dossier={dossierDialogs.type === 'form' ? dossierDialogs.item : null}
      />

      <DossierDeleteDialog
        open={dossierDialogs.isOpen('delete')}
        onOpenChange={dossierDialogs.onOpenChange}
        dossier={dossierDialogs.type === 'delete' ? dossierDialogs.item : null}
        onDeleted={(dossierId) => {
          if (selectedFolderId === dossierId) explorer.selectFolder(null)
        }}
      />
    </div>
  )
}
