import { describe, expect, it } from 'vitest'
import { received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { ABSENT_STATUS, toStatusInfo } from './serviceStatus'

const pause: ServiceDTO = {
  uuid: 'p1',
  debut: '2026-10-13T10:00:00+02:00',
  isBreak: true,
  enCours: true,
}

const service = (enPause: boolean): ServiceDTO => ({
  uuid: 's1',
  debut: '2026-10-13T08:00:00+02:00',
  isBreak: false,
  enCours: true,
  enPause,
  pauses: enPause ? [pause] : [],
})

describe('toStatusInfo', () => {
  it('en service', () => {
    const info = toStatusInfo(received({ success: true, service: service(false) }, 5))
    expect(info.status).toBe('PRESENT')
    expect(info.service?.uuid).toBe('s1')
    expect(info.pause).toBeNull()
    expect(info.receivedAt).toBe(5)
  })

  it('en pause : le service reste le service de travail, la pause en cours est repérée', () => {
    const info = toStatusInfo(received({ success: true, service: service(true) }, 5))
    expect(info.status).toBe('ON_BREAK')
    expect(info.service?.uuid).toBe('s1')
    expect(info.pause?.uuid).toBe('p1')
  })

  it('absent sans service', () => {
    expect(toStatusInfo(received({ success: true, service: null }))).toBe(ABSENT_STATUS)
    expect(toStatusInfo(received(null))).toBe(ABSENT_STATUS)
  })
})
