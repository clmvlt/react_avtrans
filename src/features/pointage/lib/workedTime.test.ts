import { describe, expect, it } from 'vitest'
import { liveDurations } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { getPointageStatus } from './pointageStatus'
import { currentWorkSegment, formatClock } from './workedTime'

const service = (extra: Partial<ServiceDTO> = {}): ServiceDTO => ({
  uuid: 's1',
  debut: '2026-10-12T21:00:00+02:00',
  isBreak: false,
  enCours: true,
  duree: 6 * 3600,
  dureePauses: 3600,
  dureeTravail: 5 * 3600,
  enPause: false,
  pauses: [
    {
      uuid: 'p1',
      debut: '2026-10-13T01:00:00+02:00',
      fin: '2026-10-13T02:00:00+02:00',
      isBreak: true,
      enCours: false,
      duree: 3600,
    },
  ],
  ...extra,
})

describe('formatClock', () => {
  it('affiche HH:MM:SS à partir de secondes', () => {
    expect(formatClock(5 * 3600)).toBe('05:00:00')
    expect(formatClock(3661)).toBe('01:01:01')
    expect(formatClock(-5)).toBe('00:00:00')
  })
})

describe('currentWorkSegment', () => {
  it('part de la fin de la dernière pause', () => {
    const s = service()
    const segment = currentWorkSegment(s, liveDurations(s, 0))
    expect(segment.start).toBe('2026-10-13T02:00:00+02:00')
    // 21:00 → 03:00 brut = 6 h, dont 5 h avant la fin de la pause
    expect(segment.seconds).toBe(3600)
  })

  it('part du début du service sans pause terminée', () => {
    const s = service({ pauses: [], duree: 1200, dureeTravail: 1200, dureePauses: 0 })
    const segment = currentWorkSegment(s, liveDurations(s, 30))
    expect(segment.start).toBe(s.debut)
    expect(segment.seconds).toBe(1230)
  })
})

describe('getPointageStatus', () => {
  it('se base sur enPause du service de travail', () => {
    expect(getPointageStatus(null)).toBe('off')
    expect(getPointageStatus(service())).toBe('working')
    expect(getPointageStatus(service({ enPause: true }))).toBe('break')
  })
})
