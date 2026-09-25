import { Banknote, Plus, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BackButton } from '@/components/shared/BackButton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { StatusChips } from '@/components/shared/StatusChips'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useCancelAcompteMutation } from '@/features/acomptes/api/useCancelAcompteMutation'
import { useMyAcomptesQuery } from '@/features/acomptes/api/useMyAcomptesQuery'
import { MyAcompteCancelSummary } from '@/features/acomptes/components/my/MyAcompteCancelSummary'
import { MyAcompteCard } from '@/features/acomptes/components/my/MyAcompteCard'
import { MyAcompteDetailDialog } from '@/features/acomptes/components/my/MyAcompteDetailDialog'
import { MyAcompteFiltersSheet } from '@/features/acomptes/components/my/MyAcompteFiltersSheet'
import { MyAcompteRequestDialog } from '@/features/acomptes/components/my/MyAcompteRequestDialog'
import { useMyAcompteFilters } from '@/features/acomptes/hooks/useMyAcompteFilters'
import {
  MY_ACOMPTE_STATUS_CHIPS,
  myAcompteFiltersHint,
} from '@/features/acomptes/lib/acompteFilters'
import { useDialogState } from '@/hooks/useDialogState'
import type { AcompteDTO } from '@/models'

/** Mes demandes d'acompte (tout utilisateur connecté), port de `MyAcomptes.vue`. */
export default function MyAcomptesPage() {
  const filtersState = useMyAcompteFilters()
  const { filters, params, loadPage, activeFilterCount, hasAnyFilter } = filtersState
  const acomptesQuery = useMyAcomptesQuery(params)
  const cancelAcompte = useCancelAcompteMutation()
  const dialogs = useDialogState<'create' | 'detail' | 'cancel', AcompteDTO>()
  const [showFilters, setShowFilters] = useState(false)

  const acomptes = acomptesQuery.data?.acomptes || []
  const currentPage = acomptesQuery.data?.currentPage || 0
  const totalPages = acomptesQuery.data?.totalPages || 1
  const totalElements = acomptesQuery.data?.totalElements || 0
  const loading = acomptesQuery.isPending || acomptesQuery.isPlaceholderData

  const apply = () => {
    setShowFilters(false)
    filtersState.apply()
  }

  const reset = () => {
    setShowFilters(false)
    filtersState.reset()
  }

  const handleCancel = () => {
    const uuid = dialogs.item?.uuid
    if (!uuid) return
    cancelAcompte.mutate(uuid, {
      onSuccess: () => {
        toast.success('Demande annulée avec succès')
        dialogs.close()
        loadPage(currentPage)
      },
      onError: (err) =>
        toast.error('Erreur', { description: errorMessage(err, "Erreur lors de l'annulation") }),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <BackButton fallback="/" />
          <h1 className="flex-1 text-lg font-bold text-foreground sm:text-xl">Mes acomptes</h1>
          <Button
            size="sm"
            aria-label="Nouvelle demande d'acompte"
            onClick={() => dialogs.open('create')}
          >
            <Plus className="size-4" />
            <span className="max-sm:sr-only">Nouvelle demande</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-3 py-3 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <StatusChips
            options={MY_ACOMPTE_STATUS_CHIPS}
            value={filters.status}
            onValueChange={filtersState.selectStatus}
            disabled={acomptesQuery.isFetching}
          />
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            aria-label="Autres filtres"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal className="size-4" />
            <span className="max-sm:sr-only">Filtres</span>
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <p className="mt-2 truncate text-xs text-muted-foreground">
          {myAcompteFiltersHint(filters)}
          {!acomptesQuery.isPending &&
            !acomptesQuery.isError &&
            ` · ${totalElements} demande${totalElements > 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[84px] w-full rounded-xl" />
            ))}
          </div>
        ) : acomptesQuery.isError ? (
          <ErrorState
            className="mt-4"
            message={errorMessage(acomptesQuery.error, 'Erreur lors du chargement')}
            onRetry={() => void acomptesQuery.refetch()}
            isRetrying={acomptesQuery.isRefetching}
          />
        ) : acomptes.length === 0 ? (
          <Empty className="mt-4 gap-4 rounded-2xl border border-dashed px-4 py-12 md:px-4 md:py-12">
            <EmptyMedia className="mb-0 size-14 rounded-full bg-muted">
              <Banknote className="size-7 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader className="gap-1">
              <EmptyTitle className="text-base font-medium tracking-normal text-foreground">
                {hasAnyFilter ? 'Aucune demande ne correspond' : "Aucune demande d'acompte"}
              </EmptyTitle>
              <EmptyDescription>
                {hasAnyFilter
                  ? "Essayez d'élargir vos filtres."
                  : 'Commencez par créer votre première demande.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasAnyFilter ? (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="size-4" />
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button size="sm" onClick={() => dialogs.open('create')}>
                  <Plus className="size-4" />
                  Faire une demande
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {acomptes.map((acompte) => (
                <MyAcompteCard
                  key={acompte.uuid}
                  acompte={acompte}
                  onOpen={(item) => dialogs.open('detail', item)}
                  onCancel={(item) => dialogs.open('cancel', item)}
                />
              ))}
            </div>
            <SimplePagination
              variant="card"
              className="mt-4"
              page={currentPage}
              totalPages={totalPages}
              onPageChange={loadPage}
            />
          </>
        )}
      </main>

      <MyAcompteFiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFieldChange={filtersState.setField}
        onApply={apply}
        onReset={reset}
      />

      <MyAcompteRequestDialog
        open={dialogs.isOpen('create')}
        onOpenChange={dialogs.onOpenChange}
        onSaved={() => loadPage(0)}
      />

      <MyAcompteDetailDialog
        open={dialogs.isOpen('detail')}
        onOpenChange={dialogs.onOpenChange}
        acompte={dialogs.item}
        onCancelRequest={(acompte) => dialogs.open('cancel', acompte)}
      />

      <ConfirmDialog
        open={dialogs.isOpen('cancel')}
        onOpenChange={dialogs.onOpenChange}
        title="Annuler la demande"
        description="Cette action est irréversible."
        icon={null}
        cancelLabel="Retour"
        confirmLabel="Confirmer l'annulation"
        isPending={cancelAcompte.isPending}
        onConfirm={handleCancel}
      >
        <MyAcompteCancelSummary acompte={dialogs.item} />
      </ConfirmDialog>
    </div>
  )
}
