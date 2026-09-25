/**
 * Absence period type
 * - FULL_DAY: Full day absence
 * - MORNING: Morning half-day absence
 * - AFTERNOON: Afternoon half-day absence
 */
export enum AbsencePeriod {
  FULL_DAY = 'FULL_DAY',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON'
}

export const AbsencePeriodLabels: Record<AbsencePeriod, string> = {
  [AbsencePeriod.FULL_DAY]: 'Journée entière',
  [AbsencePeriod.MORNING]: 'Matin',
  [AbsencePeriod.AFTERNOON]: 'Après-midi'
}
