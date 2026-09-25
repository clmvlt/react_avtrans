export type StatItem = {
  /** Valeur finale du compteur animé (qui part de 0) */
  target: number
  suffix: string
  label: string
}

export const stats: StatItem[] = [
  { target: 7, suffix: '+', label: "Années d'expérience" },
  { target: 60, suffix: 'm³', label: 'Capacité véhicule max' },
  { target: 100, suffix: '%', label: 'Traçabilité des envois' },
]

/** Durée de l'animation des compteurs (ms) */
export const STATS_COUNT_UP_DURATION_MS = 2000
