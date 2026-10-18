import { describe, expect, it } from 'vitest'
import { formatTimeInWorkday, formatWorkdayLabel, formatWorkdayTitle } from '@/lib/workday'
import type { ServiceDTO } from '@/models'
import type { JourneeTravailResponse } from '@/services'
import {
  formatWorkdayTotal,
  isWorkdayRunning,
  toDailyWorkday,
  workdayLines,
  workdayTotalSeconds,
} from './dailyWorkday'

/** Pause de 02:00 à 03:00 du service de nuit du 12/10 (21:00 → 06:00). */
const nightPause: ServiceDTO = {
  uuid: 'p1',
  isBreak: true,
  serviceParentUuid: 's1',
  debut: '2026-10-13T02:00:00+02:00',
  fin: '2026-10-13T03:00:00+02:00',
  duree: 3600,
  enCours: false,
}

const nightService = (fin: string | null, extra: Partial<ServiceDTO> = {}): ServiceDTO => ({
  uuid: 's1',
  isBreak: false,
  debut: '2026-10-12T21:00:00+02:00',
  fin: fin ?? undefined,
  enCours: !fin,
  enPause: false,
  pauses: [nightPause],
  ...extra,
})

const journee = (data: Partial<JourneeTravailResponse>) =>
  toDailyWorkday({
    data: {
      success: true,
      date: '2026-10-12',
      aujourdhui: false,
      heures: { secondes: 0, heures: 0, enCours: false },
      services: [],
      ...data,
    },
    receivedAt: 1000,
  })

describe('journée de travail des salariés de nuit', () => {
  it('le 13/10 à 06:30 : journée du lundi 12/10, service jusqu’à 06:00 (mar. 13/10), 8 h 00 figé', () => {
    const workday = journee({
      heures: { secondes: 8 * 3600, heures: 8, enCours: false },
      services: [
        nightService('2026-10-13T06:00:00+02:00', { duree: 9 * 3600, dureeTravail: 8 * 3600 }),
      ],
    })

    expect(formatWorkdayTitle(workday.date, workday.aujourdhui)).toBe(
      'Journée du lundi 12/10 (service de nuit)',
    )
    const [service, pause] = workdayLines(workday)
    expect(formatTimeInWorkday(service?.debut, workday.date)).toBe('21:00')
    expect(formatTimeInWorkday(service?.fin, workday.date)).toBe('06:00 (mar. 13/10)')
    expect(pause?.isBreak).toBe(true)
    expect(formatTimeInWorkday(pause?.debut, workday.date)).toBe('02:00 (mar. 13/10)')

    expect(isWorkdayRunning(workday)).toBe(false)
    expect(formatWorkdayTotal(workdayTotalSeconds(workday, 0))).toBe('8 h 00')
    expect(formatWorkdayTotal(workdayTotalSeconds(workday, 600))).toBe('8 h 00')
  })

  it('le 13/10 à 03:30 : service en cours, pause terminée, le total avance depuis 5 h 30', () => {
    const workday = journee({
      heures: { secondes: 5.5 * 3600, heures: 5.5, enCours: true },
      services: [nightService(null)],
    })

    expect(formatWorkdayTitle(workday.date, workday.aujourdhui)).toBe(
      'Journée du lundi 12/10 (service de nuit)',
    )
    expect(isWorkdayRunning(workday)).toBe(true)
    expect(formatWorkdayTotal(workdayTotalSeconds(workday, 0))).toBe('5 h 30')
    expect(workdayTotalSeconds(workday, 120)).toBe(5.5 * 3600 + 120)
  })

  it('le 13/10 à 21:00, après « Commencer le service » : la carte passe sur « Aujourd’hui »', () => {
    const workday = journee({
      date: '2026-10-13',
      aujourdhui: true,
      heures: { secondes: 0, heures: 0, enCours: true },
      services: [
        {
          uuid: 's2',
          isBreak: false,
          debut: '2026-10-13T21:00:00+02:00',
          enCours: true,
          pauses: [],
        },
      ],
    })

    expect(formatWorkdayTitle(workday.date, workday.aujourdhui)).toBe("Aujourd'hui")
    expect(workdayLines(workday).map((line) => line.uuid)).toEqual(['s2'])
    expect(formatTimeInWorkday(workday.services[0]?.debut, workday.date)).toBe('21:00')
  })

  it('salarié de jour sans service après minuit : « Aujourd’hui », journée vide', () => {
    const workday = journee({ date: '2026-10-14', aujourdhui: true })

    expect(formatWorkdayTitle(workday.date, workday.aujourdhui)).toBe("Aujourd'hui")
    expect(workdayLines(workday)).toEqual([])
    expect(workdayTotalSeconds(workday, 300)).toBe(0)
  })

  it('réponse incomplète : journée d’aujourd’hui vide, sans planter', () => {
    const workday = toDailyWorkday({ data: null, receivedAt: 0 })
    expect(workday).toMatchObject({ date: '', aujourdhui: true, services: [] })
    expect(formatWorkdayTitle(workday.date, workday.aujourdhui)).toBe("Aujourd'hui")
  })
})

describe('libellé de la période « jour »', () => {
  it('« Aujourd’hui », ou « Journée du 12/10 » pour la journée de la veille', () => {
    expect(formatWorkdayLabel('2026-10-13', '2026-10-13')).toBe("Aujourd'hui")
    expect(formatWorkdayLabel(undefined, '2026-10-13')).toBe("Aujourd'hui")
    expect(formatWorkdayLabel('2026-10-12', '2026-10-13')).toBe('Journée du 12/10')
  })
})
