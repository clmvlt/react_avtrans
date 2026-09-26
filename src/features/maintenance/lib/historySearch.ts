import type { SortingState } from '@tanstack/react-table'
import type { FilterConfig, FilterValues } from '@/components/shared/SearchFilters'
import type { DossierTypeEntretienDTO, TypeEntretienDTO, VehiculeDTO } from '@/models'
import type { EntretienHistoryParams } from '../api/queryKeys'
import type { EntretienRow } from './entretienRow'

/** Taille de page de l'historique (Entretiens.vue et EntretiensVehicule.vue). */
export const HISTORY_PAGE_SIZE = 20

/** Valeurs initiales des filtres (et après « Réinitialiser ») ; `vehiculeId` sur /entretiens seulement. */
export function createDefaultHistoryFilters(withVehicle: boolean): FilterValues {
  return {
    ...(withVehicle ? { vehiculeId: '' } : {}),
    dossierId: '',
    typeEntretienId: '',
    sortBy: 'dateEntretien',
    sortDirection: 'desc',
    startDate: '',
    endDate: '',
    kmMin: '',
    kmMax: '',
    coutMin: '',
    coutMax: '',
  }
}

const text = (value: unknown) => (typeof value === 'string' ? value : '')

/**
 * Corps de POST /entretiens/history, construit comme le Vue : filtres vides omis, `Number()` sur
 * les bornes (0 est donc omis, comme dans le Vue), tri serveur par défaut « date décroissante ».
 * Sur EntretiensVehicule, `vehiculeId` vient de l'URL.
 */
export function buildHistorySearchParams(
  filters: FilterValues,
  page: number,
  vehiculeId?: string,
): EntretienHistoryParams {
  const params: EntretienHistoryParams = {
    page,
    size: HISTORY_PAGE_SIZE,
    sortBy: text(filters.sortBy) || 'dateEntretien',
    sortDirection: filters.sortDirection === 'asc' ? 'asc' : 'desc',
  }
  const vehicule = vehiculeId ?? text(filters.vehiculeId)
  if (vehicule) params.vehiculeId = vehicule
  if (filters.dossierId) params.dossierId = text(filters.dossierId)
  if (filters.typeEntretienId) params.typeEntretienId = text(filters.typeEntretienId)
  if (filters.startDate) params.startDate = text(filters.startDate)
  if (filters.endDate) params.endDate = text(filters.endDate)
  if (filters.kmMin) params.kmMin = Number(filters.kmMin)
  if (filters.kmMax) params.kmMax = Number(filters.kmMax)
  if (filters.coutMin) params.coutMin = Number(filters.coutMin)
  if (filters.coutMax) params.coutMax = Number(filters.coutMax)
  return params
}

/** Types proposés par le filtre « Type d'entretien » : ceux du dossier filtré, sinon tous. */
export const typesOfDossier = (types: TypeEntretienDTO[], dossierId: unknown) =>
  dossierId ? types.filter((t) => t.dossier?.id === dossierId) : types

/**
 * Changement de filtres : un nouveau dossier efface le type choisi s'il n'en fait pas partie
 * (watcher `filterValues.dossierId` du Vue).
 */
export function applyHistoryFilterChange(
  previous: FilterValues,
  next: FilterValues,
  types: TypeEntretienDTO[],
): FilterValues {
  const dossierChanged = next.dossierId !== previous.dossierId
  if (!dossierChanged || !next.dossierId || !next.typeEntretienId) return next
  const typeInDossier = typesOfDossier(types, next.dossierId).some(
    (t) => t.id === next.typeEntretienId,
  )
  return typeInDossier ? next : { ...next, typeEntretienId: '' }
}

type HistoryFilterConfigOptions = {
  /** Filtre « Véhicule » (/entretiens seulement). */
  vehicules?: VehiculeDTO[]
  dossiers: DossierTypeEntretienDTO[]
  types: TypeEntretienDTO[]
  /** Dossier choisi dans les filtres (restreint la liste des types). */
  dossierId: unknown
}

/** Configuration de `SearchFilters` de l'historique (mêmes libellés et options que le Vue). */
export function buildHistoryFilterConfig({
  vehicules,
  dossiers,
  types,
  dossierId,
}: HistoryFilterConfigOptions): FilterConfig[] {
  return [
    ...(vehicules
      ? [
          {
            key: 'vehiculeId',
            label: 'Véhicule',
            type: 'select',
            placeholder: 'Tous les véhicules',
            options: vehicules.map((v) => ({
              value: v.id || '',
              label: `${v.brand} ${v.model} (${v.immat})`,
            })),
          } satisfies FilterConfig,
        ]
      : []),
    {
      key: 'dossierId',
      label: 'Dossier',
      type: 'select',
      placeholder: 'Tous les dossiers',
      options: dossiers.map((d) => ({ value: d.id || '', label: d.nom || '' })),
    },
    {
      key: 'typeEntretienId',
      label: "Type d'entretien",
      type: 'select',
      placeholder: 'Tous les types',
      options: typesOfDossier(types, dossierId).map((t) => ({
        value: t.id || '',
        label: t.nom || '',
      })),
    },
    {
      key: 'sortBy',
      label: 'Trier par',
      type: 'select',
      options: [
        { value: 'dateEntretien', label: "Date d'entretien" },
        { value: 'kilometrage', label: 'Kilométrage' },
        { value: 'cout', label: 'Coût HT' },
      ],
    },
    {
      key: 'sortDirection',
      label: 'Ordre',
      type: 'select',
      options: [
        { value: 'desc', label: 'Décroissant' },
        { value: 'asc', label: 'Croissant' },
      ],
    },
    { key: 'startDate', label: 'Date de début', type: 'date' },
    { key: 'endDate', label: 'Date de fin', type: 'date' },
    { key: 'kmMin', label: 'Kilométrage min', type: 'number', placeholder: 'Ex: 50000' },
    { key: 'kmMax', label: 'Kilométrage max', type: 'number', placeholder: 'Ex: 100000' },
    { key: 'coutMin', label: 'Coût HT minimum (€)', type: 'number', placeholder: '0.00' },
    { key: 'coutMax', label: 'Coût HT maximum (€)', type: 'number', placeholder: '500.00' },
  ]
}

/**
 * Recherche rapide d'Entretiens.vue : filtre **la page affichée** seulement (bug B-20 reproduit),
 * sur l'immatriculation, le type, « prénom nom » du mécanicien et le commentaire.
 */
export function filterEntretiensQuick(list: EntretienRow[], query: string): EntretienRow[] {
  if (!query) return list
  const q = query.toLowerCase()
  return list.filter(
    (e) =>
      e.vehiculeImmat?.toLowerCase().includes(q) ||
      e.typeEntretien?.nom?.toLowerCase().includes(q) ||
      `${e.mecanicien?.firstName} ${e.mecanicien?.lastName}`.toLowerCase().includes(q) ||
      e.commentaire?.toLowerCase().includes(q),
  )
}

/** Valeur de tri d'une colonne (tri client de la page affichée, comme le Vue). */
export function entretienSortValue(entretien: EntretienRow, columnId: string): string | number {
  switch (columnId) {
    case 'dateEntretien':
      return entretien.dateEntretien ? String(entretien.dateEntretien) : ''
    case 'vehiculeImmat':
      return entretien.vehiculeImmat?.toLowerCase() ?? ''
    case 'type':
      return entretien.typeEntretien?.nom?.toLowerCase() ?? ''
    case 'kilometrage':
      return entretien.kilometrage ?? 0
    case 'mecanicien':
      return `${entretien.mecanicien?.firstName ?? ''} ${entretien.mecanicien?.lastName ?? ''}`.toLowerCase()
    case 'cout':
      return entretien.cout ?? 0
    default:
      return ''
  }
}

/**
 * Tri client à trois états (croissant, décroissant, aucun) des en-têtes, appliqué à la page
 * affichée (cartes mobiles comprises) indépendamment du tri serveur « Trier par / Ordre ».
 */
export function sortEntretiens(list: EntretienRow[], sorting: SortingState): EntretienRow[] {
  const [sort] = sorting
  if (!sort) return list
  const direction = sort.desc ? -1 : 1
  return [...list].sort((a, b) => {
    const valueA = entretienSortValue(a, sort.id)
    const valueB = entretienSortValue(b, sort.id)
    if (valueA === valueB) return 0
    return valueA < valueB ? -direction : direction
  })
}
