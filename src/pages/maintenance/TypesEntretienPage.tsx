import { FolderPlus, Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
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
import { MAINTENANCE_TABS } from '@/features/maintenance/lib/maintenanceTabs'
import { useDialogState } from '@/hooks/useDialogState'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'

/**
 * /types-entretien (TypesEntretien.vue) : dossiers à gauche (zones de dépôt, empilés au-dessus sur
 * téléphone), types du dossier affiché à droite. Création, modification, suppression et
 * glisser-déposer pour l'administrateur et le mécanicien. Accessible par l'onglet
 * « Types d'entretien » de /entretiens.
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
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
          onEditFolder={(dossier) => dossierDialogs.open('form', dossier)}
          onDeleteFolder={(dossier) => dossierDialogs.open('delete', dossier)}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <TypesToolbar
            search={explorer.search}
            onSearchChange={explorer.setSearch}
            showDragHint={canManage && explorer.filteredTypes.length > 0}
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
    <PageContainer size="full">
      <PageHeader
        title="Entretiens"
        description="Les types d'entretien et leurs dossiers."
        actions={
          canManage && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => dossierDialogs.open('form')}
              >
                <FolderPlus className="size-4" />
                Nouveau dossier
              </Button>
              <Button type="button" size="sm" onClick={() => typeDialogs.open('form')}>
                <Plus className="size-4" />
                Nouveau type
              </Button>
            </>
          )
        }
      >
        <PageTabs tabs={MAINTENANCE_TABS} />
      </PageHeader>

      {renderContent()}

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
    </PageContainer>
  )
}
