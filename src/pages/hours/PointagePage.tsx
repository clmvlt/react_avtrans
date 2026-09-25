import { ErrorState } from '@/components/shared/ErrorState'
import { HistoryFiltersSheet } from '@/features/pointage/components/HistoryFiltersSheet'
import { KilometrageDialog } from '@/features/pointage/components/KilometrageDialog'
import { MobileActionBar } from '@/features/pointage/components/MobileActionBar'
import { PointageActions } from '@/features/pointage/components/PointageActions'
import { PointageHeader } from '@/features/pointage/components/PointageHeader'
import { PointageSkeleton } from '@/features/pointage/components/PointageSkeleton'
import { ServiceHistorySection } from '@/features/pointage/components/ServiceHistorySection'
import { StatusHeroCard } from '@/features/pointage/components/StatusHeroCard'
import { TodayServicesCard } from '@/features/pointage/components/TodayServicesCard'
import { WorkedHoursStats } from '@/features/pointage/components/WorkedHoursStats'
import { useGeolocation } from '@/features/pointage/hooks/useGeolocation'
import { useKilometrage } from '@/features/pointage/hooks/useKilometrage'
import { usePointageActions } from '@/features/pointage/hooks/usePointageActions'
import { usePointageData } from '@/features/pointage/hooks/usePointageData'
import { usePointageHistory } from '@/features/pointage/hooks/usePointageHistory'
import { getPointageStatus } from '@/features/pointage/lib/pointageStatus'

/**
 * /pointage (Pointage.vue), surtout utilisé sur téléphone par les chauffeurs : carte d'état avec
 * chrono, compteurs, services du jour, historique ; actions dans une barre fixe en bas sous `md`.
 * Une erreur d'action passe par un toast et la page reste affichée.
 */
export default function PointagePage() {
  const geolocation = useGeolocation()
  const data = usePointageData()
  const history = usePointageHistory()
  const kilometrage = useKilometrage()
  const actions = usePointageActions({
    requestLocation: () => geolocation.requestLocation(),
    needsKilometrage: kilometrage.mustEnterToday,
    onKilometrageRequired: () => kilometrage.openDialog(true),
  })

  const isLoading = data.isLoading || kilometrage.isStatusLoading
  const isReady = !isLoading && !data.loadErrorMessage

  const actionButtons = (
    <PointageActions
      status={getPointageStatus(data.activeService)}
      loading={actions.isPending}
      layout="row"
      onStart={actions.start}
      onPause={actions.pause}
      onResume={actions.resume}
      onEnd={actions.end}
    />
  )

  const renderContent = () => {
    if (data.loadErrorMessage) {
      return (
        <ErrorState
          message={data.loadErrorMessage}
          onRetry={data.retry}
          isRetrying={data.isRetrying}
        />
      )
    }
    if (isLoading) return <PointageSkeleton />

    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start lg:gap-6">
        {/* Colonne gauche : état, compteurs, services du jour */}
        <div className="space-y-4">
          <StatusHeroCard
            activeService={data.activeService}
            todayServices={data.todayServices}
            locationDenied={geolocation.permission === 'denied'}
            onRetryLocation={() => void geolocation.requestLocation()}
            showKilometrageReminder={kilometrage.mustEnterToday}
            onOpenKilometrage={() => kilometrage.openDialog(false)}
          >
            {actionButtons}
          </StatusHeroCard>
          <WorkedHoursStats hours={data.workedHours} />
          <TodayServicesCard services={data.todayServices} activeService={data.activeService} />
        </div>

        {/* Colonne droite : historique */}
        <ServiceHistorySection
          query={history.query}
          page={history.page}
          onPageChange={history.changePage}
          activeFilterCount={history.activeFilterCount}
          onOpenFilters={() => history.setFiltersOpen(true)}
          onResetFilters={history.reset}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
      <PointageHeader onOpenKilometrage={() => kilometrage.openDialog(false)} />

      <main className="mx-auto max-w-[1100px] px-3 py-3 sm:px-6 sm:py-6">{renderContent()}</main>

      {/* Masquée pendant le chargement initial et en cas d'erreur de chargement */}
      {isReady && <MobileActionBar>{actionButtons}</MobileActionBar>}

      <HistoryFiltersSheet
        open={history.filtersOpen}
        onOpenChange={history.setFiltersOpen}
        value={history.filters}
        onApply={history.apply}
        onReset={history.reset}
      />

      <KilometrageDialog
        open={kilometrage.dialog.open}
        onOpenChange={kilometrage.onOpenChange}
        required={kilometrage.dialog.required}
        defaultVehiculeId={kilometrage.lastVehiculeId}
        defaultsLoading={kilometrage.isLastVehiculeLoading}
        isSaving={kilometrage.isSaving}
        errorMessage={kilometrage.saveErrorMessage}
        onSubmit={(values) => kilometrage.save(values, actions.startNow)}
      />
    </div>
  )
}
