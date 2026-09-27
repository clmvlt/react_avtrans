import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useTypeCartesQuery } from '@/features/cartes/api/useTypeCartesQuery'
import { CartesListSkeleton } from '@/features/cartes/components/CartesListSkeleton'
import { ListSearchInput } from '@/features/cartes/components/ListSearchInput'
import { TypeCarteDeleteDialog } from '@/features/cartes/components/TypeCarteDeleteDialog'
import { TypeCarteFormDialog } from '@/features/cartes/components/TypeCarteFormDialog'
import { TypeCarteMobileList } from '@/features/cartes/components/TypeCarteMobileList'
import { TypesCartesTable } from '@/features/cartes/components/TypesCartesTable'
import { filterTypesCartes } from '@/features/cartes/lib/cartes'
import { CARTE_TABS } from '@/features/cartes/lib/carteTabs'
import { useDialogState } from '@/hooks/useDialogState'
import type { TypeCarteDTO } from '@/models'

/**
 * Types de cartes (`/types-cartes`, admin) : liste, recherche, CRUD. Accessible par l'onglet
 * « Types de cartes » de la page Cartes.
 */
export default function TypesCartesPage() {
  const typesQuery = useTypeCartesQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const dialogs = useDialogState<'form' | 'delete', TypeCarteDTO>()

  const openEdit = (typeCarte: TypeCarteDTO) => dialogs.open('form', typeCarte)
  const openDelete = (typeCarte: TypeCarteDTO) => dialogs.open('delete', typeCarte)
  const formType = dialogs.type === 'form' ? dialogs.item : null

  let content
  if (typesQuery.isPending) {
    content = <CartesListSkeleton label="Chargement des types de cartes..." />
  } else if (!typesQuery.data) {
    content = (
      <ErrorState
        message={
          (typesQuery.error instanceof Error && typesQuery.error.message) ||
          'Erreur lors du chargement des types de cartes'
        }
        onRetry={() => void typesQuery.refetch()}
        isRetrying={typesQuery.isRefetching}
      />
    )
  } else {
    const filteredTypes = filterTypesCartes(typesQuery.data, searchQuery)
    content = (
      <div className="space-y-4">
        <ListSearchInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Rechercher un type de carte..."
          className="max-w-md"
        />

        <TypeCarteMobileList types={filteredTypes} onEdit={openEdit} onDelete={openDelete} />
        <TypesCartesTable types={filteredTypes} onEdit={openEdit} onDelete={openDelete} />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Cartes"
        description="Les types de cartes disponibles."
        actions={
          <Button type="button" size="sm" onClick={() => dialogs.open('form')}>
            <Plus className="size-4" />
            Nouveau type
          </Button>
        }
      >
        <PageTabs tabs={CARTE_TABS} />
      </PageHeader>
      {content}

      <TypeCarteFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        isCreating={!formType}
        typeCarteUuid={formType?.uuid}
      />
      <TypeCarteDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        typeCarte={dialogs.type === 'delete' ? dialogs.item : null}
      />
    </PageContainer>
  )
}
