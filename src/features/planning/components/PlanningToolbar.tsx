import type { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PlanningPeriodController } from '../hooks/usePlanningPeriod'
import { CustomRangeControls } from './CustomRangeControls'
import { PeriodNavigator } from './PeriodNavigator'

type PlanningToolbarProps = {
  period: PlanningPeriodController
  /** Libellé de la période (semaine ou mois). */
  periodLabel: string
  /** Résumé de la grille affichée (« 12 employés · 30 jours · 1 férié »), à droite. */
  summary?: string
  /** Actions de la page (export), au bout de la barre. */
  actions?: ReactNode
}

/**
 * Barre d'outils compacte du planning, en haut de la page (qui n'a pas d'en-tête : la grille
 * prend toute la place) : type de période, navigation ou plage personnalisée, résumé de la
 * grille, puis les actions (export).
 */
export function PlanningToolbar({ period, periodLabel, summary, actions }: PlanningToolbarProps) {
  const isCustom = period.period.periodType === 'custom'

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-card p-2">
      <Tabs value={period.period.periodType} onValueChange={period.changePeriodType}>
        <TabsList className="h-8 max-sm:w-full">
          <TabsTrigger value="week" className="text-xs">
            Semaine
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs">
            Mois
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            Personnalisé
          </TabsTrigger>
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

      <div className="ml-auto flex items-center gap-3">
        {summary && <p className="text-xs text-muted-foreground max-lg:hidden">{summary}</p>}
        {actions}
      </div>
    </div>
  )
}
