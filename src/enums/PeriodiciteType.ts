/**
 * Maintenance periodicity type
 * - KILOMETRAGE: Maintenance based on vehicle mileage
 * - TEMPOREL: Maintenance based on time/date
 */
export enum PeriodiciteType {
  KILOMETRAGE = 'KILOMETRAGE',
  TEMPOREL = 'TEMPOREL'
}

export const PeriodiciteTypeLabels: Record<PeriodiciteType, string> = {
  [PeriodiciteType.KILOMETRAGE]: 'Kilométrage',
  [PeriodiciteType.TEMPOREL]: 'Temporel'
}
