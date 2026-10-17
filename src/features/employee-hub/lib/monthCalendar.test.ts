import { describe, expect, it } from 'vitest'
import { formatClock, formatDayHours } from './formatters'
import { chunkWeeks, dayFillRatio, monthGridRange, shiftMonth } from './monthCalendar'

describe('monthGridRange', () => {
  it('commence le lundi et finit le dimanche qui encadrent le mois', () => {
    // Octobre 2026 : jeudi 1er, samedi 31
    expect(monthGridRange({ year: 2026, month: 10 })).toEqual({
      startDate: '2026-09-28',
      endDate: '2026-11-01',
    })
  })

  it('ne déborde pas quand le mois commence un lundi et finit un dimanche', () => {
    // Février 2027 : lundi 1er, dimanche 28
    expect(monthGridRange({ year: 2027, month: 2 })).toEqual({
      startDate: '2027-02-01',
      endDate: '2027-02-28',
    })
  })

  it('traverse le passage à l’heure d’été sans décaler les jours', () => {
    // Mars 2026 : dimanche 1er (heure d'été le 29)
    expect(monthGridRange({ year: 2026, month: 3 })).toEqual({
      startDate: '2026-02-23',
      endDate: '2026-04-05',
    })
  })
})

describe('shiftMonth', () => {
  it("change d'année dans les deux sens", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth({ year: 2026, month: 5 }, -14)).toEqual({ year: 2025, month: 3 })
  })
})

describe('chunkWeeks', () => {
  it('découpe en semaines de 7 jours', () => {
    const weeks = chunkWeeks(Array.from({ length: 35 }, (_, index) => index))
    expect(weeks).toHaveLength(5)
    expect(weeks[4]).toEqual([28, 29, 30, 31, 32, 33, 34])
  })
})

describe('formats', () => {
  it('formatDayHours : heures et minutes, vide sans travail', () => {
    expect(formatDayHours(0)).toBe('')
    expect(formatDayHours(59)).toBe('')
    expect(formatDayHours(45 * 60)).toBe('45min')
    expect(formatDayHours(7 * 3600 + 5 * 60 + 59)).toBe('7h05')
    expect(formatDayHours(8 * 3600)).toBe('8h')
  })

  it('formatClock : compteur hh:mm:ss', () => {
    expect(formatClock(0)).toBe('00:00:00')
    expect(formatClock(3 * 3600 + 12 * 60 + 45.9)).toBe('03:12:45')
    expect(formatClock(-5)).toBe('00:00:00')
  })

  it('dayFillRatio : 8 h = jauge pleine, bornée entre 0 et 1', () => {
    expect(dayFillRatio(4 * 3600)).toBe(0.5)
    expect(dayFillRatio(12 * 3600)).toBe(1)
    expect(dayFillRatio(-1)).toBe(0)
  })
})
