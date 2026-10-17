import { describe, expect, it } from 'vitest'
import type { ServiceDTO } from '@/models'
import { groupHistoryByDay } from './groupHistoryByDay'

describe('groupHistoryByDay', () => {
  it('critère 5 : un jour avec une pause de 30 min affiche le temps net', () => {
    // Service 08:00 → 12:00 (4 h brutes) avec une pause de 30 min : 3 h 30 nettes
    const history: ServiceDTO[] = [
      {
        uuid: 'p1',
        debut: '2026-10-12T10:00:00+02:00',
        fin: '2026-10-12T10:30:00+02:00',
        isBreak: true,
        enCours: false,
        duree: 1800,
        serviceParentUuid: 's1',
      },
      {
        uuid: 's1',
        debut: '2026-10-12T08:00:00+02:00',
        fin: '2026-10-12T12:00:00+02:00',
        isBreak: false,
        enCours: false,
        duree: 4 * 3600,
        dureePauses: 1800,
        dureeTravail: 3.5 * 3600,
      },
    ]
    const [day] = groupHistoryByDay(history)
    expect(day?.date).toBe('2026-10-12')
    expect(day?.totalHours).toBe('3h 30m')
    expect(day?.countLabel).toBe('1 service · 1 pause')
  })

  it('un service de nuit compte en entier sur son jour de début, pause comprise', () => {
    const history: ServiceDTO[] = [
      {
        uuid: 'p1',
        debut: '2026-10-13T01:00:00+02:00',
        fin: '2026-10-13T02:00:00+02:00',
        isBreak: true,
        duree: 3600,
        serviceParentUuid: 's1',
      },
      {
        uuid: 's1',
        debut: '2026-10-12T21:00:00+02:00',
        isBreak: false,
        enCours: true,
        duree: 6 * 3600,
        dureePauses: 3600,
        dureeTravail: 5 * 3600,
        enPause: false,
      },
    ]
    const days = groupHistoryByDay(history, 60)
    expect(days.map((day) => day.date)).toEqual(['2026-10-12'])
    expect(days[0]?.totalHours).toBe('5h 01m')
  })

  it('trie les jours du plus récent au plus ancien', () => {
    const line = (uuid: string, debut: string): ServiceDTO => ({
      uuid,
      debut,
      fin: debut,
      isBreak: false,
      duree: 0,
      dureeTravail: 0,
    })
    const days = groupHistoryByDay([
      line('a', '2026-10-10T08:00:00+02:00'),
      line('b', '2026-10-12T08:00:00+02:00'),
    ])
    expect(days.map((day) => day.date)).toEqual(['2026-10-12', '2026-10-10'])
  })
})
