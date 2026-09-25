import { CalendarX, Plus, RotateCcw, SlidersHorizontal } from 'lucide-react'
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
import { useAbsenceTypesQuery } from '@/features/absences/api/useAbsenceTypesQuery'
import { useCancelAbsenceMutation } from '@/features/absences/api/useCancelAbsenceMutation'
import { useMyAbsencesQuery } from '@/features/absences/api/useMyAbsencesQuery'
import { MyAbsenceCancelSummary } from '@/features/absences/components/my/MyAbsenceCancelSummary'
import { MyAbsenceCard } from '@/features/absences/components/my/MyAbsenceCard'
import { MyAbsenceDetailDialog } from '@/features/absences/components/my/MyAbsenceDetailDialog'
import { MyAbsenceFiltersSheet } from '@/features/absences/components/my/MyAbsenceFiltersSheet'
import { MyAbsenceRequestDialog } from '@/features/absences/components/my/MyAbsenceRequestDialog'
import { useMyAbsenceFilters } from '@/features/absences/hooks/useMyAbsenceFilters'
import {
  MY_ABSENCE_STATUS_CHIPS,
  myAbsenceFiltersHint,
} from '@/features/absences/lib/absenceFilters'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useDialogState } from '@/hooks/useDialogState'
import type { AbsenceDTO } from '@/models'

/** Mes demandes d'absence (tout utilisateur connecté), port de `MyAbsences.vue`. */
export default function MyAbsencesPage() {
  const filtersState = useMyAbsenceFilters()
  const { filters, params, loadPage, activeFilterCount, hasAnyFilter } = filtersState
  const absencesQuery = useMyAbsencesQuery(params)
  const { data: absenceTypes = [] } = useAbsenceTypesQuery()
  const cancelAbsence = useCancelAbsenceMutation()
  const dialogs = useDialogState<'create' | 'detail' | 'cancel', AbsenceDTO>()
  const [showFilters, setShowFilters] = useState(false)

  const absences = absencesQuery.data?.absences || []
  const currentPage = absencesQuery.data?.currentPage || 0
  const totalPages = absencesQuery.data?.totalPages || 1
  const totalElements = absencesQuery.data?.totalElements || 0
  const loading = absencesQuery.isPending || absencesQuery.isPlaceholderData

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
    cancelAbsence.mutate(uuid, {
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
          <h1 className="flex-1 text-lg font-bold text-foreground sm:text-xl">Mes absences</h1>
          <Button
            size="sm"
            aria-label="Nouvelle demande d'absence"
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
            options={MY_ABSENCE_STATUS_CHIPS}
            value={filters.status}
            onValueChange={filtersState.selectStatus}
            disabled={absencesQuery.isFetching}
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
          {myAbsenceFiltersHint(filters, absenceTypes)}
          {!absencesQuery.isPending &&
            !absencesQuery.isError &&
            ` · ${totalElements} demande${totalElements > 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[84px] w-full rounded-xl" />
            ))}
          </div>
        ) : absencesQuery.isError ? (
          <ErrorState
            className="mt-4"
            message={errorMessage(absencesQuery.error, 'Erreur lors du chargement')}
            onRetry={() => void absencesQuery.refetch()}
            isRetrying={absencesQuery.isRefetching}
          />
        ) : absences.length === 0 ? (
          <Empty className="mt-4 gap-4 rounded-2xl border border-dashed px-4 py-12 md:px-4 md:py-12">
            <EmptyMedia className="mb-0 size-14 rounded-full bg-muted">
              <CalendarX className="size-7 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader className="gap-1">
              <EmptyTitle className="text-base font-medium tracking-normal text-foreground">
                {hasAnyFilter ? 'Aucune demande ne correspond' : "Aucune demande d'absence"}
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
              {absences.map((absence) => (
                <MyAbsenceCard
                  key={absence.uuid}
                  absence={absence}
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

      <MyAbsenceFiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFieldChange={filtersState.setField}
        absenceTypes={absenceTypes}
        onApply={apply}
        onReset={reset}
      />

      <MyAbsenceRequestDialog
        open={dialogs.isOpen('create')}
        onOpenChange={dialogs.onOpenChange}
        onSaved={() => loadPage(0)}
      />

      <MyAbsenceDetailDialog
        open={dialogs.isOpen('detail')}
        onOpenChange={dialogs.onOpenChange}
        absence={dialogs.item}
        onCancelRequest={(absence) => dialogs.open('cancel', absence)}
      />

      <ConfirmDialog
        open={dialogs.isOpen('cancel')}
        onOpenChange={dialogs.onOpenChange}
        title="Annuler la demande"
        description="Cette action est irréversible."
        icon={null}
        cancelLabel="Retour"
        confirmLabel="Confirmer l'annulation"
        isPending={cancelAbsence.isPending}
        onConfirm={handleCancel}
      >
        <MyAbsenceCancelSummary absence={dialogs.item} />
      </ConfirmDialog>
    </div>
  )
}
