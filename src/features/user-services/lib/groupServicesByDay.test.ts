import { describe, expect, it } from 'vitest'
import type { ServiceDTO } from '@/models'
import { groupServicesByDay } from './groupServicesByDay'

const nightLines = (): ServiceDTO[] => [
  {
    uuid: 'p1',
    debut: '2026-10-13T01:00:00+02:00',
    fin: '2026-10-13T02:00:00+02:00',
    isBreak: true,
    enCours: false,
    duree: 3600,
    serviceParentUuid: 's1',
  },
  {
    uuid: 's1',
    debut: '2026-10-12T21:00:00+02:00',
    fin: '2026-10-13T05:00:00+02:00',
    isBreak: false,
    enCours: false,
    duree: 8 * 3600,
    dureePauses: 3600,
    dureeTravail: 7 * 3600,
  },
]

describe('groupServicesByDay', () => {
  it('rattache la pause après minuit au jour de son service, avec le badge de décalage', () => {
    const [day, ...rest] = groupServicesByDay(nightLines())
    expect(rest).toHaveLength(0)
    expect(day?.date).toBe('2026-10-12')
    expect(day?.allServices.map((s) => s.uuid)).toEqual(['s1', 'p1'])
    const [s1, p1] = day?.allServices ?? []
    expect(s1?.startDayLabel).toBe('')
    expect(s1?.endDayLabel).not.toBe('')
    expect(p1?.startDayLabel).not.toBe('')
  })

  it('affiche le temps net du service et la durée de la pause', () => {
    const [day] = groupServicesByDay(nightLines())
    expect(day?.allServices.map((s) => s.durationSeconds)).toEqual([7 * 3600, 3600])
    expect(day?.totalSeconds).toBe(7 * 3600)
    expect(day?.totalHours).toBe('7h')
    expect(day?.hasWork).toBe(true)
  })

  it('fait avancer un service en cours', () => {
    const lines: ServiceDTO[] = [
      {
        uuid: 's1',
        debut: '2026-10-12T08:00:00+02:00',
        isBreak: false,
        enCours: true,
        enPause: false,
        duree: 3600,
        dureePauses: 0,
        dureeTravail: 3600,
      },
    ]
    const [day] = groupServicesByDay(lines, 1800)
    expect(day?.totalHours).toBe('1h 30min')
    expect(day?.allServices[0]?.durationSeconds).toBe(5400)
  })

  it("une journée de pauses seules (filtre « Pauses ») n'a pas de total", () => {
    const [day] = groupServicesByDay([nightLines()[0] as ServiceDTO])
    expect(day?.hasWork).toBe(false)
    expect(day?.totalSeconds).toBe(0)
  })
})
