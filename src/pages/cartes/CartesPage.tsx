import { useState } from 'react'
import { Plus, Tags } from 'lucide-react'
import { Link } from 'react-router'
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
        className="mb-4"
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
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/types-cartes">
              <Tags className="size-4" />
              Types de cartes
            </Link>
          </Button>
          <Button type="button" size="sm" onClick={() => dialogs.open('form')}>
            <Plus className="size-4" />
            Nouvelle carte
          </Button>
        </div>

        <ListSearchInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Rechercher par nom, numéro, type, utilisateur..."
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
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px]">{content}</div>
      </main>

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
    </div>
  )
}
