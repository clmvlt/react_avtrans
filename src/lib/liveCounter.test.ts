import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HeuresPeriodeDTO, ServiceDTO, UserContractComparisonDTO, UserDTO } from '@/models'
import {
  currentPause,
  elapsedSecondsSince,
  liveContractComparison,
  liveDurations,
  liveLineSeconds,
  livePeriodHours,
  livePeriodSeconds,
  liveSeconds,
  receive,
  received,
} from './liveCounter'

/** Service de nuit : 12/10 à 21:00, pause le 13/10 de 01:00 à 02:00, réponse calculée à 03:00. */
const nightService = (): ServiceDTO => ({
  uuid: 'service-1',
  debut: '2026-10-12T21:00:00+02:00',
  fin: undefined,
  isBreak: false,
  calculeLe: '2026-10-13T03:00:00+02:00',
  enCours: true,
  duree: 6 * 3600,
  dureePauses: 3600,
  dureeTravail: 5 * 3600,
  enPause: false,
  pauses: [
    {
      uuid: 'pause-1',
      debut: '2026-10-13T01:00:00+02:00',
      fin: '2026-10-13T02:00:00+02:00',
      isBreak: true,
      enCours: false,
      duree: 3600,
      serviceParentUuid: 'service-1',
    },
  ],
})

const period = (secondes: number, enCours: boolean): HeuresPeriodeDTO => ({
  secondes,
  heures: Math.round((secondes / 3600) * 100) / 100,
  enCours,
})

describe('elapsedSecondsSince', () => {
  it('compte les secondes entières écoulées depuis la réception', () => {
    expect(elapsedSecondsSince(1000, 1000)).toBe(0)
    expect(elapsedSecondsSince(1000, 1999)).toBe(0)
    expect(elapsedSecondsSince(1000, 2000)).toBe(1)
    expect(elapsedSecondsSince(1000, 61_500)).toBe(60)
  })

  it("n'est jamais négatif (tick antérieur à la réception)", () => {
    expect(elapsedSecondsSince(5000, 1000)).toBe(0)
  })
})

describe('liveSeconds', () => {
  it("n'avance que si le compteur avance", () => {
    expect(liveSeconds(100, true, 30)).toBe(130)
    expect(liveSeconds(100, false, 30)).toBe(100)
    expect(liveSeconds(undefined, true, 30)).toBe(30)
  })

  it('ne renvoie jamais une valeur négative', () => {
    expect(liveSeconds(-3600, false, 0)).toBe(0)
  })
})

describe('critère 1 : service de nuit en cours', () => {
  it('affiche 5:00:00 de travail net et avance', () => {
    const service = nightService()
    expect(liveDurations(service, 0).dureeTravail).toBe(5 * 3600)
    expect(liveDurations(service, 90).dureeTravail).toBe(5 * 3600 + 90)
    expect(liveDurations(service, 90).duree).toBe(6 * 3600 + 90)
    // Pas en pause : la durée des pauses ne bouge pas
    expect(liveDurations(service, 90).dureePauses).toBe(3600)
    expect(liveDurations(service, 90).pause).toBeNull()
  })

  it('la semaine affiche 5 h et avance, « Aujourd’hui » (13/10) reste à 0 h', () => {
    const week = period(5 * 3600, true)
    const day = period(0, false)
    expect(livePeriodHours(week, 0)).toBe(5)
    expect(livePeriodSeconds(week, 600)).toBe(5 * 3600 + 600)
    expect(livePeriodSeconds(day, 600)).toBe(0)
  })

  it('aucune valeur négative, même avec des données incohérentes', () => {
    const service = { ...nightService(), duree: -10, dureeTravail: -10, dureePauses: -10 }
    const durations = liveDurations(service, 0)
    expect(durations.duree).toBeGreaterThanOrEqual(0)
    expect(durations.dureeTravail).toBeGreaterThanOrEqual(0)
    expect(durations.dureePauses).toBeGreaterThanOrEqual(0)
    expect(livePeriodSeconds(period(-60, false), 0)).toBe(0)
  })
})

describe('critère 2 : pendant une pause', () => {
  const onBreak = (): ServiceDTO => {
    const service = nightService()
    return {
      ...service,
      enPause: true,
      duree: 7 * 3600,
      dureePauses: 3600 + 600,
      dureeTravail: 7 * 3600 - 4200,
      pauses: [
        ...(service.pauses ?? []),
        {
          uuid: 'pause-2',
          debut: '2026-10-13T03:50:00+02:00',
          isBreak: true,
          enCours: true,
          duree: 600,
          serviceParentUuid: 'service-1',
        },
      ],
    }
  }

  it('le travail net est figé, la pause en cours et le total des pauses avancent', () => {
    const service = onBreak()
    const before = liveDurations(service, 0)
    const after = liveDurations(service, 120)
    expect(after.dureeTravail).toBe(before.dureeTravail)
    expect(after.dureePauses).toBe(before.dureePauses + 120)
    expect(after.pause?.uuid).toBe('pause-2')
    expect(after.dureePause).toBe(600 + 120)
    expect(after.duree).toBe(before.duree + 120)
  })

  it('trouve la pause en cours parmi les pauses du service', () => {
    expect(currentPause(onBreak())?.uuid).toBe('pause-2')
    expect(currentPause(nightService())).toBeNull()
    expect(currentPause(null)).toBeNull()
  })

  it("la ligne d'une pause en cours avance d'elle-même", () => {
    const pause = currentPause(onBreak())
    expect(pause && liveLineSeconds(pause, 30)).toBe(630)
  })
})

describe('critères 3 et 4 : rechargement et arrière-plan', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("relève l'instant de réception sur l'horloge monotone, une fois la réponse arrivée", async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(42_000)
    const response = await receive(Promise.resolve({ secondes: 10 }))
    expect(response).toEqual({ data: { secondes: 10 }, receivedAt: 42_000 })
    expect(now).toHaveBeenCalled()
  })

  it("après un rechargement, la valeur repart de celle de l'API (rien n'est reporté)", () => {
    const week = period(5 * 3600, true)
    const first = received(week, 0)
    // Dix minutes plus tard, la page est rechargée : nouvelle réponse, nouvel instant de réception
    const second = received(period(5 * 3600 + 600, true), 600_000)
    expect(livePeriodSeconds(first.data, elapsedSecondsSince(first.receivedAt, 600_000))).toBe(
      5 * 3600 + 600,
    )
    expect(livePeriodSeconds(second.data, elapsedSecondsSince(second.receivedAt, 600_000))).toBe(
      5 * 3600 + 600,
    )
  })

  it('après plusieurs minutes en arrière-plan, la valeur est juste sans dépendre des ticks', () => {
    const service = nightService()
    const { receivedAt } = received(service, 1_000)
    // Aucun tick pendant 7 min 30 s (onglet masqué) : le premier tick au retour suffit
    const elapsed = elapsedSecondsSince(receivedAt, 1_000 + 450_000)
    expect(liveDurations(service, elapsed).dureeTravail).toBe(5 * 3600 + 450)
  })
})

describe('critère 6 : comparaison au contrat', () => {
  const comparison = (enCours: boolean): UserContractComparisonDTO => ({
    user: {} as UserDTO,
    year: 2026,
    month: 10,
    heureContrat: 151.67,
    heuresEffectuees: 100,
    difference: -51.67,
    pourcentageRealisation: 65.93,
    joursAbsence: 0,
    joursOuvres: 22,
    joursTravailles: 12,
    moyenneHeuresParJour: 8.33,
    heuresAbsences: 7,
    heuresFeries: 0,
    heuresTotal: 107,
    differenceTotal: -44.67,
    pourcentageTotal: 70.55,
    heuresRestantesPrevues: 49,
    heuresPrevisionnelles: 156,
    differencePrevisionnelle: 4.33,
    enCours,
  })

  it('avance quand enCours : effectuées, total, écarts et pourcentages', () => {
    const live = liveContractComparison(comparison(true), 1800)
    expect(live.heuresEffectuees).toBeCloseTo(100.5)
    expect(live.difference).toBeCloseTo(-51.17)
    expect(live.heuresTotal).toBeCloseTo(107.5)
    expect(live.differenceTotal).toBeCloseTo(-44.17)
    expect(live.pourcentageRealisation).toBe(Math.round((100.5 / 151.67) * 10000) / 100)
    expect(live.pourcentageTotal).toBe(Math.round((107.5 / 151.67) * 10000) / 100)
  })

  it('la prévision de fin de mois ne bouge pas', () => {
    const live = liveContractComparison(comparison(true), 1800)
    expect(live.heuresPrevisionnelles).toBe(156)
    expect(live.differencePrevisionnelle).toBe(4.33)
    // Déjà fait + encore prévu = total prévu
    expect((live.heuresTotal ?? 0) + (live.heuresRestantesPrevues ?? 0)).toBeCloseTo(156)
  })

  it('reste fixe sans service en cours', () => {
    const base = comparison(false)
    expect(liveContractComparison(base, 1800)).toBe(base)
  })

  it('sans contrat, les pourcentages restent nuls', () => {
    const live = liveContractComparison(
      {
        ...comparison(true),
        heureContrat: null,
        difference: null,
        pourcentageRealisation: null,
        differenceTotal: null,
        pourcentageTotal: null,
      },
      3600,
    )
    expect(live.heuresEffectuees).toBe(101)
    expect(live.difference).toBeNull()
    expect(live.pourcentageRealisation).toBeNull()
    expect(live.pourcentageTotal).toBeNull()
  })
})
