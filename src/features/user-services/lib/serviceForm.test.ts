import { describe, expect, it } from 'vitest'
import type { ServiceFormValues } from '../schemas/serviceForm'
import { NO_COORDINATES, parentCandidatesSearch, toServicePayload } from './serviceForm'

const values = (extra: Partial<ServiceFormValues> = {}): ServiceFormValues => ({
  isBreak: true,
  debutDate: '2026-10-13',
  debutTime: '01:00',
  hasEnd: true,
  finDate: '2026-10-13',
  finTime: '02:00',
  serviceParentUuid: '',
  ...extra,
})

describe('toServicePayload', () => {
  it("n'envoie pas de service en automatique", () => {
    expect(toServicePayload(values(), NO_COORDINATES).serviceParentUuid).toBeUndefined()
  })

  it('envoie le service choisi pour une pause', () => {
    const payload = toServicePayload(values({ serviceParentUuid: 's1' }), NO_COORDINATES)
    expect(payload.serviceParentUuid).toBe('s1')
  })

  it("n'envoie pas un service inchangé (l'API re-rattache une pause déplacée)", () => {
    const payload = toServicePayload(values({ serviceParentUuid: 's1' }), NO_COORDINATES, 's1')
    expect(payload.serviceParentUuid).toBeUndefined()
  })

  it("n'envoie jamais de service pour un service de travail", () => {
    const payload = toServicePayload(
      values({ isBreak: false, serviceParentUuid: 's1' }),
      NO_COORDINATES,
    )
    expect(payload.serviceParentUuid).toBeUndefined()
  })
})

describe('parentCandidatesSearch', () => {
  it('cherche les services du jour et de la veille', () => {
    expect(parentCandidatesSearch('2026-10-13')).toMatchObject({
      isBreak: false,
      startDate: '2026-10-12T00:00:00',
      endDate: '2026-10-13T23:59:59',
    })
  })
})
