import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PlanningPeriodController } from '../hooks/usePlanningPeriod'
import { CustomRangeControls } from './CustomRangeControls'
import { PeriodNavigator } from './PeriodNavigator'

type PlanningToolbarProps = {
  period: PlanningPeriodController
  /** Libellé de la période (semaine ou mois). */
  periodLabel: string
}

/**
 * Barre d'outils du planning, sous l'en-tête de la page : type de période, puis navigation ou
 * plage personnalisée. À partir de `md`, elle reste collée sous l'en-tête de l'application
 * (`top-14`, sous son `z-30`) pendant le défilement de la grille.
 */
export function PlanningToolbar({ period, periodLabel }: PlanningToolbarProps) {
  const isCustom = period.period.periodType === 'custom'

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 md:sticky md:top-14 md:z-20 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
      <Tabs value={period.period.periodType} onValueChange={period.changePeriodType}>
        <TabsList className="max-md:w-full">
          <TabsTrigger value="week">Semaine</TabsTrigger>
          <TabsTrigger value="month">Mois</TabsTrigger>
          <TabsTrigger value="custom">Personnalisé</TabsTrigger>
        </TabsList>
      </Tabs>

      {isCustom ? (
        <CustomRangeControls
          startDate={period.period.customStartDate}
          endDate={period.period.customEndDate}
          onStartDateChange={period.setCustomStartDate}
          onEndDateChange={period.setCustomEndDate}
          isValid={period.isCustomRangeValid}
          onApply={period.applyCustomRange}
          onPreset={period.applyPreset}
          error={period.customDateError}
        />
      ) : (
        <PeriodNavigator
          label={periodLabel}
          onPrevious={period.goToPrevious}
          onNext={period.goToNext}
          onToday={period.goToToday}
        />
      )}
    </div>
  )
}
