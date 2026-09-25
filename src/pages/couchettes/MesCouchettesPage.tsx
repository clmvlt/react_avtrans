import { toast } from 'sonner'
import { BackButton } from '@/components/shared/BackButton'
import { ErrorState } from '@/components/shared/ErrorState'
import { useCreateMyCouchetteMutation } from '@/features/couchettes/api/useCreateMyCouchetteMutation'
import { useDeleteMyCouchetteMutation } from '@/features/couchettes/api/useDeleteMyCouchetteMutation'
import { CouchetteCounters } from '@/features/couchettes/components/CouchetteCounters'
import { CouchetteHistory } from '@/features/couchettes/components/CouchetteHistory'
import { MesCouchettesSkeleton } from '@/features/couchettes/components/MesCouchettesSkeleton'
import { MyCouchetteDeleteDialog } from '@/features/couchettes/components/MyCouchetteDeleteDialog'
import { TodayCouchetteCard } from '@/features/couchettes/components/TodayCouchetteCard'
import { useMyCouchettes } from '@/features/couchettes/hooks/useMyCouchettes'
import { useDialogState } from '@/hooks/useDialogState'
import type { CouchetteDTO } from '@/models'

/** /mycouchettes (permission couchette) : déclarer ou annuler sa couchette du jour, historique. */
export default function MesCouchettesPage() {
  const myCouchettes = useMyCouchettes()
  const { query } = myCouchettes
  const createCouchette = useCreateMyCouchetteMutation()
  const deleteCouchette = useDeleteMyCouchetteMutation()
  const deleteDialog = useDialogState<'delete', CouchetteDTO>()

  const handleCreate = () => {
    createCouchette.mutate(undefined, {
      onSuccess: () => {
        toast.success('Couchette déclarée avec succès', { duration: 5000 })
        myCouchettes.showFirstPage()
      },
      onError: (error) => {
        toast.error(error.message || 'Erreur lors de la déclaration', { duration: 7000 })
      },
    })
  }

  const handleDelete = () => {
    const uuid = deleteDialog.item?.uuid
    if (!uuid) return
    deleteCouchette.mutate(uuid, {
      onSuccess: () => {
        toast.success('Couchette supprimée', { duration: 5000 })
        deleteDialog.close()
      },
      onError: (error) => {
        toast.error(error.message || 'Erreur lors de la suppression', { duration: 7000 })
      },
    })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          {/* Retour vers la landing sans historique : bug B-13 conservé */}
          <BackButton fallback="/" />
          <h1 className="flex-1 text-lg font-bold text-foreground sm:text-xl">Mes couchettes</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-3 py-3 sm:px-6 sm:py-6">
        {query.isPending ? (
          <MesCouchettesSkeleton />
        ) : query.isError ? (
          <ErrorState
            className="rounded-xl"
            message={query.error.message || 'Erreur lors du chargement des couchettes'}
            onRetry={myCouchettes.retry}
            isRetrying={query.isFetching}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start lg:gap-6">
            {/* Colonne gauche : état du jour + compteurs */}
            <div className="space-y-4">
              <TodayCouchetteCard
                todayLabel={myCouchettes.todayLabel}
                todayCouchette={myCouchettes.todayCouchette}
                creating={createCouchette.isPending}
                deleting={deleteCouchette.isPending}
                onCreate={handleCreate}
                onCancelToday={(couchette) => deleteDialog.open('delete', couchette)}
              />
              <CouchetteCounters
                monthCount={myCouchettes.monthCount}
                totalElements={myCouchettes.totalElements}
              />
            </div>

            {/* Colonne droite : historique */}
            <CouchetteHistory
              groups={myCouchettes.groups}
              isEmpty={myCouchettes.couchettes.length === 0}
              totalElements={myCouchettes.totalElements}
              loading={query.isFetching}
              todayKey={myCouchettes.todayKey}
              currentPage={myCouchettes.currentPage}
              totalPages={myCouchettes.totalPages}
              onPageChange={myCouchettes.goToPage}
              onDelete={(couchette) => deleteDialog.open('delete', couchette)}
            />
          </div>
        )}
      </main>

      <MyCouchetteDeleteDialog
        open={deleteDialog.isOpen('delete')}
        onOpenChange={deleteDialog.onOpenChange}
        couchette={deleteDialog.item}
        isPending={deleteCouchette.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
