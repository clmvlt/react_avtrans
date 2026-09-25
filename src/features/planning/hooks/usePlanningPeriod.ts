import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PlanningQueryParams } from '@/services/absences'
import { planningKeys } from '../api/queryKeys'
import {
  buildPlanningParams,
  getDefaultCustomRange,
  getPresetRange,
  getTodayPeriod,
  shiftPeriod,
  type PlanningPeriodType,
} from '../lib/planningDates'

export type PlanningPeriodFields = {
  periodType: PlanningPeriodType
  year: number
  month: number
  /** Semaine ISO (combinée à l'année civile, comme le Vue : B-03). */
  week: number
  /** Plage personnalisée en cours de saisie (appliquée par « Afficher » ou un préréglage). */
  customStartDate: string
  customEndDate: string
}

type PeriodState = {
  period: PlanningPeriodFields
  customDateError: string
  /** Paramètres de la dernière période chargée (clé de la requête). */
  params: PlanningQueryParams
}

function createInitialState(): PeriodState {
  const period: PlanningPeriodFields = {
    periodType: 'month',
    ...getTodayPeriod(),
    customStartDate: '',
    customEndDate: '',
  }
  return { period, customDateError: '', params: buildPlanningParams(period) }
}

const sameParams = (a: PlanningQueryParams, b: PlanningQueryParams) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * Période affichée par le planning (onglets semaine / mois / personnalisé, navigation,
 * préréglages). Comme le Vue, chaque action recharge explicitement la période (loadPlanning) ;
 * la saisie des dates personnalisées n'est appliquée que par « Afficher » ou un préréglage.
 * Pas d'état dans l'URL (Q-URL).
 */
export function usePlanningPeriod() {
  const queryClient = useQueryClient()
  const [state, setState] = useState(createInitialState)
  const { period } = state

  /** loadPlanning du Vue : valide la plage personnalisée, puis charge (ou recharge) la période. */
  const load = (next: PlanningPeriodFields) => {
    let customDateError = ''
    if (next.periodType === 'custom') {
      if (!next.customStartDate || !next.customEndDate) {
        customDateError = 'Les deux dates sont requises.'
      } else if (next.customStartDate > next.customEndDate) {
        customDateError = 'La date de début doit être avant la date de fin.'
      }
    }

    if (customDateError) {
      setState({ period: next, customDateError, params: state.params })
      return
    }

    const params = buildPlanningParams(next)
    setState({ period: next, customDateError: '', params })
    // Même période : le Vue relançait la requête
    if (sameParams(params, state.params)) {
      void queryClient.refetchQueries({ queryKey: planningKeys.detail(params), exact: true })
    }
  }

  const changePeriodType = (value: string) => {
    const periodType = value as PlanningPeriodType
    let next: PlanningPeriodFields = { ...period, periodType }
    // Mode personnalisé : mois courant et suivant si aucune plage n'a encore été saisie
    if (periodType === 'custom' && !period.customStartDate) {
      next = { ...next, ...getDefaultCustomRange() }
    }
    load(next)
  }

  return {
    period,
    params: state.params,
    customDateError: state.customDateError,
    isCustomRangeValid:
      !!period.customStartDate &&
      !!period.customEndDate &&
      period.customStartDate <= period.customEndDate,
    changePeriodType,
    goToPrevious: () => load(shiftPeriod(period, -1)),
    goToNext: () => load(shiftPeriod(period, 1)),
    goToToday: () => load({ ...period, ...getTodayPeriod() }),
    setCustomStartDate: (customStartDate: string) =>
      setState((current) => ({ ...current, period: { ...current.period, customStartDate } })),
    setCustomEndDate: (customEndDate: string) =>
      setState((current) => ({ ...current, period: { ...current.period, customEndDate } })),
    applyCustomRange: () => load(period),
    applyPreset: (months: number) => load({ ...period, ...getPresetRange(months) }),
  }
}

export type PlanningPeriodController = ReturnType<typeof usePlanningPeriod>
