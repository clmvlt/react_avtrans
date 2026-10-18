import { isPeriodRunning, livePeriodSeconds, type Received } from '@/lib/liveCounter'
import { withPauses } from '@/lib/serviceLines'
import type { HeuresPeriodeDTO, ServiceDTO } from '@/models'
import type { JourneeTravailResponse } from '@/services'

/** Journée de travail en cours de l'utilisateur connecté, avec l'instant de sa réception. */
export type DailyWorkday = {
  /** Jour de rattachement `YYYY-MM-DD` (vide tant qu'il n'est pas connu) */
  date: string
  /** `false` : journée d'un service de nuit commencé la veille */
  aujourdhui: boolean
  /** Temps net de la journée selon l'API (avance si `enCours`) */
  heures: HeuresPeriodeDTO | undefined
  /** Services de travail de la journée, pauses imbriquées */
  services: ServiceDTO[]
  receivedAt: number
}

export const EMPTY_WORKDAY: DailyWorkday = {
  date: '',
  aujourdhui: true,
  heures: undefined,
  services: [],
  receivedAt: 0,
}

/** Réponse de GET /services/user/daily, normalisée (champs manquants : journée d'aujourd'hui vide). */
export function toDailyWorkday({
  data,
  receivedAt,
}: Received<JourneeTravailResponse | null>): DailyWorkday {
  return {
    date: data?.date ?? '',
    aujourdhui: data?.aujourdhui !== false,
    heures: data?.heures ?? undefined,
    services: Array.isArray(data?.services) ? data.services : [],
    receivedAt,
  }
}

/** Services et pauses de la journée, à plat, dans l'ordre (frise). */
export const workdayLines = (workday: DailyWorkday) => withPauses(workday.services)

/** La journée a un service en cours hors pause : son total avance. */
export const isWorkdayRunning = (workday: DailyWorkday) => isPeriodRunning(workday.heures)

/** Temps net de la journée affiché, en secondes (`heures` de l'API, en direct). */
export const workdayTotalSeconds = (workday: DailyWorkday, elapsed: number) =>
  livePeriodSeconds(workday.heures, elapsed)

/** Total d'une journée : « 8 h 00 », « 5 h 30 ». */
export function formatWorkdayTotal(seconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  return `${Math.floor(totalMinutes / 60)} h ${String(totalMinutes % 60).padStart(2, '0')}`
}
