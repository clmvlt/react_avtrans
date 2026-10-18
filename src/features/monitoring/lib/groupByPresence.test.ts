import { describe, expect, it } from 'vitest'
import type { ServiceDTO, UserWithStatusDTO } from '@/models'
import { isServiceOutsideWorkday, workdayHint } from './groupByPresence'

const nightService: ServiceDTO = {
  uuid: 's1',
  isBreak: false,
  debut: '2026-10-12T21:00:00+02:00',
  enCours: true,
}

describe('présences et journée de travail', () => {
  it('« Journée du 12/10 » à côté des heures quand la journée est celle de la veille', () => {
    expect(workdayHint({ journee: '2026-10-12' }, '2026-10-13')).toBe('Journée du 12/10')
    expect(workdayHint({ journee: '2026-10-13' }, '2026-10-13')).toBe('')
    expect(workdayHint({}, '2026-10-13')).toBe('')
  })

  it('le service de nuit est compté dans la journée : pas de compteur à part', () => {
    const user: UserWithStatusDTO = { journee: '2026-10-12' }
    expect(isServiceOutsideWorkday(user, nightService, '2026-10-13')).toBe(false)
  })

  it('sans `journee` (ancienne API), un service commencé la veille reste affiché à part', () => {
    expect(isServiceOutsideWorkday({}, nightService, '2026-10-13')).toBe(true)
    expect(isServiceOutsideWorkday({}, null, '2026-10-13')).toBe(false)
  })
})
