import { useState } from 'react'
import { getISOWeek, getISOWeekYear, getISOWeeksInYear } from '../lib/isoWeek'
import {
  shiftDayKey,
  todayKeyUtc,
  toHoursQueryParams,
  type HoursPeriod,
  type HoursPeriodState,
} from '../lib/hoursPeriod'

/** Repères « maintenant », figés à l'ouverture du dialog (le Vue les figeait au montage). */
function getNowMarks() {
  const now = new Date()
  return {
    today: todayKeyUtc(now),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
    currentWeek: getISOWeek(now),
    currentISOYear: getISOWeekYear(now),
  }
}

/**
 * Période du dialog « Heures travaillées » : un état minimal (période, année, mois, semaine, jour),
 * d'où découlent les paramètres de la requête. Toute la navigation reprend UserHoursModal.vue, y
 * compris ses limites (semaine suivante sans borne, année précédente sous 2020, bug B-01).
 * L'état naît avec le dialog : chaque ouverture repart de « Toutes » et d'aujourd'hui.
 */
export function useHoursPeriod() {
  const [marks] = useState(getNowMarks)
  const [state, setState] = useState<HoursPeriodState>(() => ({
    period: 'all',
    year: marks.currentISOYear,
    month: marks.currentMonth,
    week: marks.currentWeek,
    dateString: marks.today,
  }))

  const update = (patch: Partial<HoursPeriodState>) =>
    setState((current) => ({ ...current, ...patch }))

  return {
    state,
    marks,
    params: toHoursQueryParams(state),
    isToday: state.dateString === marks.today,
    isCurrentMonth: state.year === marks.currentYear && state.month === marks.currentMonth,

    setPeriod: (period: HoursPeriod) => update({ period }),
    setYear: (year: number) => update({ year }),
    setMonth: (month: number) => update({ month }),
    setWeek: (year: number, week: number) => update({ year, week }),
    setDateString: (dateString: string) => update({ dateString }),

    previousYear: () => setState((s) => ({ ...s, year: s.year - 1 })),
    nextYear: () => setState((s) => (s.year < marks.currentYear ? { ...s, year: s.year + 1 } : s)),
    goToCurrentYear: () => update({ year: marks.currentYear }),

    previousMonth: () =>
      setState((s) =>
        s.month > 1 ? { ...s, month: s.month - 1 } : { ...s, year: s.year - 1, month: 12 },
      ),
    nextMonth: () =>
      setState((s) =>
        s.month < 12 ? { ...s, month: s.month + 1 } : { ...s, year: s.year + 1, month: 1 },
      ),
    goToCurrentMonth: () => update({ year: marks.currentYear, month: marks.currentMonth }),

    previousWeek: () =>
      setState((s) =>
        s.week > 1
          ? { ...s, week: s.week - 1 }
          : { ...s, year: s.year - 1, week: getISOWeeksInYear(s.year - 1) },
      ),
    nextWeek: () =>
      setState((s) =>
        s.week < getISOWeeksInYear(s.year)
          ? { ...s, week: s.week + 1 }
          : { ...s, year: s.year + 1, week: 1 },
      ),
    goToCurrentWeek: () => update({ year: marks.currentISOYear, week: marks.currentWeek }),

    previousDay: () => setState((s) => ({ ...s, dateString: shiftDayKey(s.dateString, -1) })),
    nextDay: () => setState((s) => ({ ...s, dateString: shiftDayKey(s.dateString, 1) })),
    goToToday: () => update({ dateString: marks.today }),
  }
}

export type HoursPeriodController = ReturnType<typeof useHoursPeriod>
