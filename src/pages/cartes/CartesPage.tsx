import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useCartesQuery } from '@/features/cartes/api/useCartesQuery'
import { CarteDeleteDialog } from '@/features/cartes/components/CarteDeleteDialog'
import { CarteFormDialog } from '@/features/cartes/components/CarteFormDialog'
import { CarteMobileList } from '@/features/cartes/components/CarteMobileList'
import { CartesListSkeleton } from '@/features/cartes/components/CartesListSkeleton'
import { CartesTable } from '@/features/cartes/components/CartesTable'
import { ListSearchInput } from '@/features/cartes/components/ListSearchInput'
import { useRevealedSecrets } from '@/features/cartes/hooks/useRevealedSecrets'
import { filterCartes } from '@/features/cartes/lib/cartes'
import { CARTE_TABS } from '@/features/cartes/lib/carteTabs'
import { useDialogState } from '@/hooks/useDialogState'
import type { CarteDTO } from '@/models'

/** Cartes (carburant, bancaires…) : liste, recherche, secrets masqués, CRUD (`/cartes`, admin). */
export default function CartesPage() {
  const cartesQuery = useCartesQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const secrets = useRevealedSecrets()
  const dialogs = useDialogState<'form' | 'delete', CarteDTO>()

  const openEdit = (carte: CarteDTO) => dialogs.open('form', carte)
  const openDelete = (carte: CarteDTO) => dialogs.open('delete', carte)
  const formCarte = dialogs.type === 'form' ? dialogs.item : null

  let content
  if (cartesQuery.isPending) {
    content = <CartesListSkeleton label="Chargement des cartes..." />
  } else if (!cartesQuery.data) {
    content = (
      <ErrorState
        message={
          (cartesQuery.error instanceof Error && cartesQuery.error.message) ||
          'Erreur lors du chargement des cartes'
        }
        onRetry={() => void cartesQuery.refetch()}
        isRetrying={cartesQuery.isRefetching}
      />
    )
  } else {
    const cartes = cartesQuery.data
    const filteredCartes = filterCartes(cartes, searchQuery)
    content = (
      <div className="space-y-4">
        <ListSearchInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Rechercher par nom, numéro, type, utilisateur..."
          className="max-w-md"
        />

        <CarteMobileList
          filteredCartes={filteredCartes}
          cartes={cartes}
          secrets={secrets}
          onEdit={openEdit}
          onDelete={openDelete}
        />
        <CartesTable
          filteredCartes={filteredCartes}
          cartes={cartes}
          secrets={secrets}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Cartes"
        description="Cartes carburant, péage et bancaires de l'entreprise."
        actions={
          <Button type="button" size="sm" onClick={() => dialogs.open('form')}>
            <Plus className="size-4" />
            Nouvelle carte
          </Button>
        }
      >
        <PageTabs tabs={CARTE_TABS} />
      </PageHeader>
      {content}

      <CarteFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        isCreating={!formCarte}
        carteUuid={formCarte?.uuid}
      />
      <CarteDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        carte={dialogs.type === 'delete' ? dialogs.item : null}
      />
    </PageContainer>
  )
}
