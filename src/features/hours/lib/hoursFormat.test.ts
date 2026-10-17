import { describe, expect, it } from 'vitest'
import type { UserWithHoursDTO } from '@/models'
import { buildUserHoursRows, computeHoursTotals, hasRunningHours } from './hoursFormat'

const entries: UserWithHoursDTO[] = [
  {
    user: { uuid: 'u1', firstName: 'Jean', lastName: 'Dupont' },
    hours: {
      hoursDay: { secondes: 0, heures: 0, enCours: false },
      hoursWeek: { secondes: 18000, heures: 5, enCours: true },
      hoursMonth: { secondes: 36000, heures: 10, enCours: true },
      hoursLastMonth: { secondes: 3600, heures: 1, enCours: false },
      hoursYear: { secondes: 72000, heures: 20, enCours: true },
    },
  },
  {
    user: { uuid: 'u2', firstName: 'Ana', lastName: 'Martin' },
    hours: {
      hoursDay: { secondes: 7200, heures: 2, enCours: false },
    },
  },
]

describe('buildUserHoursRows', () => {
  it('lit les secondes de chaque période et fait avancer celles en cours', () => {
    const [row] = buildUserHoursRows(entries, 1800)
    expect(row?.hoursDay).toBe(0)
    expect(row?.hoursWeek).toBe(5.5)
    expect(row?.hoursMonth).toBe(10.5)
    expect(row?.hoursLastMonth).toBe(1)
    expect(row?.hoursYear).toBe(20.5)
  })

  it('une période absente vaut 0', () => {
    expect(buildUserHoursRows(entries)[1]?.hoursWeek).toBe(0)
  })
})

describe('computeHoursTotals', () => {
  it('additionne les heures de tous les employés, en direct', () => {
    const totals = computeHoursTotals(entries, 3600)
    expect(totals.day).toBe(2)
    expect(totals.week).toBe(6)
    expect(totals.lastMonth).toBe(1)
  })
})

describe('hasRunningHours', () => {
  it('repère un compteur qui avance', () => {
    expect(hasRunningHours(entries)).toBe(true)
    expect(hasRunningHours(entries.slice(1))).toBe(false)
  })
})
