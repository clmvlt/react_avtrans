import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { useDialogState } from '@/hooks/useDialogState'
import type { TypeCarteDTO } from '@/models'

/**
 * Types de cartes (`/types-cartes`, admin) : liste, recherche, CRUD. Accessible seulement depuis
 * le bouton de la page Cartes ; pas de bouton retour, comme le Vue.
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
        className="mb-4"
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
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            aria-label="Nouveau type"
            onClick={() => dialogs.open('form')}
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">Nouveau type</span>
          </Button>
        </div>

        <ListSearchInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Rechercher un type de carte..."
        />

        <TypeCarteMobileList types={filteredTypes} onEdit={openEdit} onDelete={openDelete} />
        <TypesCartesTable types={filteredTypes} onEdit={openEdit} onDelete={openDelete} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1200px]">{content}</div>
      </main>

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
    </div>
  )
}
