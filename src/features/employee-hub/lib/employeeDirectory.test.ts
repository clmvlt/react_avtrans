import { describe, expect, it } from 'vitest'
import { UserStatus } from '@/enums'
import type { UserDTO, UserWithStatusDTO } from '@/models'
import { buildDirectory, groupDirectory, normalizeSearch } from './employeeDirectory'
import { employeeHubPath } from './hubLocation'
import { parseHubTab } from './hubTabs'

const user = (uuid: string, firstName: string, lastName: string, extra: Partial<UserDTO> = {}) =>
  ({ uuid, firstName, lastName, isActive: true, ...extra }) satisfies UserDTO

const users: UserDTO[] = [
  user('1', 'Zoé', 'Martin'),
  user('2', 'Élodie', 'Bernard'),
  user('3', 'Hugo', 'Masqué', { isVisible: false }),
  user('4', 'Paul', 'Attente', { isActive: false }),
  user('5', 'Anne', 'Martin'),
]

const statuses: UserWithStatusDTO[] = [
  { uuid: '1', status: UserStatus.PRESENT },
  { uuid: '5', status: UserStatus.ON_BREAK },
]

describe('buildDirectory', () => {
  it('garde les comptes actifs et visibles, triés par nom puis prénom, avec leur présence', () => {
    const entries = buildDirectory(users, statuses)
    expect(entries.map((entry) => entry.user.uuid)).toEqual(['2', '5', '1'])
    expect(entries.map((entry) => entry.presence)).toEqual(['ABSENT', 'ON_BREAK', 'PRESENT'])
    expect(entries[0]?.fullName).toBe('Élodie Bernard')
  })

  it("garde l'employé affiché même masqué ou inactif", () => {
    expect(buildDirectory(users, [], '3').some((entry) => entry.user.uuid === '3')).toBe(true)
    expect(buildDirectory(users, [], '4').some((entry) => entry.user.uuid === '4')).toBe(true)
  })
})

describe('groupDirectory', () => {
  it('regroupe par présence dans l’ordre en service, en pause, pas en service', () => {
    const groups = groupDirectory(buildDirectory(users, statuses))
    expect(groups.map((group) => [group.presence, group.entries.length])).toEqual([
      ['PRESENT', 1],
      ['ON_BREAK', 1],
      ['ABSENT', 1],
    ])
  })
})

describe('normalizeSearch', () => {
  it('ignore les accents, la casse et les espaces autour', () => {
    expect(normalizeSearch('  Élodie ')).toBe('elodie')
  })
})

describe('URL de la fiche', () => {
  it('employeeHubPath : employé puis onglet', () => {
    expect(employeeHubPath(undefined)).toBe('/employes')
    expect(employeeHubPath('abc')).toBe('/employes?employe=abc')
    expect(employeeHubPath('abc', 'absences')).toBe('/employes?employe=abc&onglet=absences')
  })

  it("parseHubTab : onglet inconnu ou indisponible → l'aperçu", () => {
    expect(parseHubTab('absences', false)).toBe('absences')
    expect(parseHubTab('couchettes', false)).toBe('apercu')
    expect(parseHubTab('couchettes', true)).toBe('couchettes')
    expect(parseHubTab('nimporte', true)).toBe('apercu')
    expect(parseHubTab(null, true)).toBe('apercu')
  })
})
