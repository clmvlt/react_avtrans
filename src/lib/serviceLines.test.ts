import { describe, expect, it } from 'vitest'
import type { ServiceDTO } from '@/models'
import {
  formatSince,
  groupLinesByServiceDay,
  hasRunningLine,
  sumWorkSeconds,
  withPauses,
} from './serviceLines'

const service = (uuid: string, debut: string, extra: Partial<ServiceDTO> = {}): ServiceDTO => ({
  uuid,
  debut,
  isBreak: false,
  enCours: false,
  ...extra,
})

const pause = (uuid: string, debut: string, parent?: string, extra: Partial<ServiceDTO> = {}) =>
  service(uuid, debut, { isBreak: true, serviceParentUuid: parent, ...extra })

describe('groupLinesByServiceDay', () => {
  it('une pause après minuit reste sur le jour de son service', () => {
    const lines = [
      pause('p1', '2026-10-13T01:00:00+02:00', 's1'),
      service('s1', '2026-10-12T21:00:00+02:00'),
    ]
    const groups = groupLinesByServiceDay(lines)
    expect([...groups.keys()]).toEqual(['2026-10-12'])
    expect(groups.get('2026-10-12')?.map((l) => l.uuid)).toEqual(['p1', 's1'])
  })

  it('une pause dont le service est sur une autre page garde son propre jour', () => {
    const groups = groupLinesByServiceDay([pause('p1', '2026-10-13T01:00:00+02:00', 'absent')])
    expect([...groups.keys()]).toEqual(['2026-10-13'])
  })

  it('ignore les lignes sans début valide', () => {
    expect(groupLinesByServiceDay([service('s1', 'pas une date')]).size).toBe(0)
  })
})

describe('sumWorkSeconds', () => {
  it('additionne le temps net des services et jamais les pauses', () => {
    const lines = [
      service('s1', '2026-10-12T08:00:00+02:00', { duree: 4 * 3600, dureeTravail: 3.5 * 3600 }),
      pause('p1', '2026-10-12T10:00:00+02:00', 's1', { duree: 1800 }),
    ]
    expect(sumWorkSeconds(lines, 0)).toBe(3.5 * 3600)
  })

  it('fait avancer un service en cours hors pause', () => {
    const running = service('s1', '2026-10-12T08:00:00+02:00', {
      enCours: true,
      duree: 3600,
      dureeTravail: 3600,
    })
    expect(sumWorkSeconds([running], 60)).toBe(3660)
    expect(hasRunningLine([running])).toBe(true)
  })
})

describe('withPauses', () => {
  it('place chaque service avant ses pauses', () => {
    const s1 = service('s1', '2026-10-12T08:00:00+02:00', {
      pauses: [pause('p1', '2026-10-12T10:00:00+02:00', 's1')],
    })
    expect(withPauses([s1]).map((l) => l.uuid)).toEqual(['s1', 'p1'])
  })
})

describe('formatSince', () => {
  it("donne l'heure seule le jour même, la date sinon", () => {
    expect(formatSince('2026-10-13T08:05:00+02:00', '2026-10-13')).toBe('08:05')
    expect(formatSince('2026-10-12T21:00:00+02:00', '2026-10-13')).toBe('le 12/10 à 21:00')
  })
})
