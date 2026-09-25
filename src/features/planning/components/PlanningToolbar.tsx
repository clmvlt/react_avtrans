import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PlanningPeriodController } from '../hooks/usePlanningPeriod'
import { CustomRangeControls } from './CustomRangeControls'
import { PeriodNavigator } from './PeriodNavigator'

type PlanningToolbarProps = {
  period: PlanningPeriodController
  /** Libellé de la période (semaine ou mois). */
  periodLabel: string
}

/** En-tête collant du planning : type de période, puis navigation ou plage personnalisée. */
export function PlanningToolbar({ period, periodLabel }: PlanningToolbarProps) {
  const isCustom = period.period.periodType === 'custom'

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-6 md:py-4">
        <Tabs value={period.period.periodType} onValueChange={period.changePeriodType}>
          <TabsList>
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
    </header>
  )
}
