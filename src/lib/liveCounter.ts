import type { HeuresPeriodeDTO, ServiceDTO, UserContractComparisonDTO } from '@/models'

/**
 * Compteurs en direct (D12, MIGRATION.md section 14).
 *
 * L'API calcule toutes les durées à l'instant `calculeLe` de sa réponse. Le front n'additionne
 * jamais de lignes brutes : il affiche ces valeurs et fait seulement avancer celles qui sont en
 * cours, d'une seconde par seconde, jusqu'à la réponse suivante :
 *
 *   valeur affichée (s) = base + (avance ? floor((performance.now() - reçuÀ) / 1000) : 0)
 *
 * `reçuÀ` est relevé sur l'horloge monotone du navigateur à la réception de la réponse
 * (`receive`). `calculeLe` n'est jamais comparé à l'horloge du PC, qui peut être décalée.
 */

/** Réponse de l'API et instant de sa réception (`performance.now()`, en ms). */
export type Received<T> = {
  data: T
  receivedAt: number
}

/** Horloge monotone du navigateur (ms), insensible aux changements d'heure du PC. */
export const monotonicNow = () => performance.now()

/** Associe une réponse à l'instant de sa réception (par défaut : maintenant). */
export function received<T>(data: T, receivedAt: number = monotonicNow()): Received<T> {
  return { data, receivedAt }
}

/** `queryFn` d'une requête en direct : attend la réponse et note l'instant de sa réception. */
export async function receive<T>(request: Promise<T>): Promise<Received<T>> {
  const data = await request
  return received(data)
}

/** Secondes entières écoulées depuis la réception (jamais négatif). */
export function elapsedSecondsSince(receivedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - receivedAt) / 1000))
}

/** `base` plus le temps écoulé s'il avance (secondes, jamais négatif). */
export function liveSeconds(
  base: number | null | undefined,
  advancing: boolean | null | undefined,
  elapsed: number,
): number {
  return Math.max(0, (base ?? 0) + (advancing ? elapsed : 0))
}

/** Une période avance : un de ses services est en cours hors pause. */
export const isPeriodRunning = (period: HeuresPeriodeDTO | null | undefined) =>
  period?.enCours === true

/** Temps net d'une période, en secondes. */
export const livePeriodSeconds = (period: HeuresPeriodeDTO | null | undefined, elapsed: number) =>
  liveSeconds(period?.secondes, period?.enCours, elapsed)

/** Temps net d'une période, en heures décimales. */
export const livePeriodHours = (period: HeuresPeriodeDTO | null | undefined, elapsed: number) =>
  livePeriodSeconds(period, elapsed) / 3600

/** La ligne (service ou pause) n'a pas de fin. */
export const isLineRunning = (line: ServiceDTO) => line.enCours ?? !line.fin

/** Pause en cours d'un service de travail (il y en a au plus une), `null` sinon. */
export function currentPause(service: ServiceDTO | null | undefined): ServiceDTO | null {
  return service?.pauses?.find(isLineRunning) ?? null
}

/** Durées d'une ligne au moment de l'affichage, en secondes. */
export type LiveDurations = {
  /** Durée brute de la ligne */
  duree: number
  /** Service : temps de travail net ; pause : sa durée */
  dureeTravail: number
  /** Service : durée de ses pauses ; pause : 0 */
  dureePauses: number
  /** Pause en cours du service, et sa durée */
  pause: ServiceDTO | null
  dureePause: number
}

/**
 * Durées d'un service de travail ou d'une pause :
 * - `duree` avance si la ligne est en cours ;
 * - `dureeTravail` avance si le service est en cours hors pause ;
 * - `dureePauses` et la durée de la pause en cours avancent pendant une pause.
 */
export function liveDurations(line: ServiceDTO, elapsed: number): LiveDurations {
  const enCours = isLineRunning(line)
  const duree = liveSeconds(line.duree, enCours, elapsed)
  if (line.isBreak) {
    return { duree, dureeTravail: duree, dureePauses: 0, pause: null, dureePause: 0 }
  }
  const enPause = enCours && line.enPause === true
  const pause = currentPause(line)
  return {
    duree,
    dureeTravail: liveSeconds(line.dureeTravail ?? line.duree, enCours && !enPause, elapsed),
    dureePauses: liveSeconds(line.dureePauses, enPause, elapsed),
    pause,
    dureePause: pause ? liveSeconds(pause.duree, enPause, elapsed) : 0,
  }
}

/** Durée affichée d'une ligne : temps net d'un service, durée d'une pause (secondes). */
export const liveLineSeconds = (line: ServiceDTO, elapsed: number) =>
  liveDurations(line, elapsed).dureeTravail

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * Comparaison au contrat en direct : si `enCours`, le temps écoulé (en heures) s'ajoute aux heures
 * effectuées, au total et aux deux écarts, et les pourcentages sont recalculés (même arrondi que
 * l'API). La prévision de fin de mois ne bouge pas : les heures encore prévues diminuent d'autant
 * pour que « déjà fait + encore prévu = total prévu » reste vrai.
 */
export function liveContractComparison<T extends UserContractComparisonDTO>(
  comparison: T,
  elapsed: number,
): T {
  if (!comparison.enCours || elapsed <= 0) return comparison
  const hours = elapsed / 3600
  const contrat = comparison.heureContrat
  const percent = (value: number) =>
    contrat && contrat > 0 ? round2((value / contrat) * 100) : null
  const plus = (value: number | null | undefined) => (value == null ? value : value + hours)

  const heuresEffectuees = (comparison.heuresEffectuees ?? 0) + hours
  const heuresTotal = plus(comparison.heuresTotal)
  return {
    ...comparison,
    heuresEffectuees,
    difference: plus(comparison.difference) ?? null,
    pourcentageRealisation:
      comparison.pourcentageRealisation == null
        ? comparison.pourcentageRealisation
        : percent(heuresEffectuees),
    heuresTotal,
    differenceTotal: plus(comparison.differenceTotal),
    pourcentageTotal:
      comparison.pourcentageTotal == null || heuresTotal == null
        ? comparison.pourcentageTotal
        : percent(heuresTotal),
    heuresRestantesPrevues:
      comparison.heuresRestantesPrevues == null
        ? comparison.heuresRestantesPrevues
        : Math.max(0, comparison.heuresRestantesPrevues - hours),
  }
}

/** Rafraîchissement de fond des requêtes en direct (resynchronisation avec l'API). */
export const LIVE_REFETCH_INTERVAL_MS = 5 * 60_000

/**
 * Options TanStack Query d'une requête en direct : nouvelle requête au retour sur l'onglet
 * (`visibilitychange`, désactivé globalement) et toutes les 5 minutes tant qu'il est visible.
 */
export const liveQueryOptions = {
  refetchOnWindowFocus: true,
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
} as const
