import type { LiveDurations } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'

/**
 * Temps affichés par la carte d'état. Aucun total n'est recalculé à partir des lignes brutes
 * (D12) : les durées viennent de l'API (`dureeTravail`, `duree` des pauses) et avancent en direct
 * (`liveDurations`). Seul le segment en cours (depuis la fin de la dernière pause) est déduit,
 * à partir des horodatages de l'API, jamais de l'horloge du PC.
 */

const toMs = (value: ServiceDTO['debut']) => new Date(value ?? '').getTime()

/** Segment de travail en cours d'un service hors pause : depuis quand, et sa durée (s). */
export type WorkSegment = {
  start: ServiceDTO['debut']
  seconds: number
}

/**
 * Segment en cours : depuis la fin de la dernière pause terminée, ou depuis le début du service.
 * Durée = durée brute du service − (début du segment − début du service).
 */
export function currentWorkSegment(service: ServiceDTO, durations: LiveDurations): WorkSegment {
  const lastEnded = [...(service.pauses ?? [])].reverse().find((pause) => !!pause.fin)
  if (!lastEnded?.fin) return { start: service.debut, seconds: durations.duree }
  const offset = Math.round((toMs(lastEnded.fin) - toMs(service.debut)) / 1000)
  return {
    start: lastEnded.fin,
    seconds: Number.isNaN(offset) ? durations.duree : Math.max(0, durations.duree - offset),
  }
}

const pad2 = (value: number) => value.toString().padStart(2, '0')

/** Chrono « HH:MM:SS » à partir de secondes (largeur stable, lisible d'un coup d'œil). */
export function formatClock(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}
