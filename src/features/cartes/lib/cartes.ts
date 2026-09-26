import type { CarteDTO, TypeCarteDTO, UserDTO } from '@/models'

/**
 * Numéro masqué : `**** **** **** 1234`, ou en clair s'il est révélé.
 *
 * Bug B-30 du Vue reproduit (MIGRATION.md 8.2, non autorisé) : la carte « révélée » est retrouvée
 * **par son numéro** (première carte portant ce numéro), si bien que deux cartes au même numéro
 * partagent l'état révélé et que la seconde ne peut pas être révélée seule ; un numéro de
 * 4 caractères ou moins s'affiche toujours en clair.
 */
export function maskCardNumber(
  numero: string | undefined,
  cartes: CarteDTO[],
  revealedNumeros: ReadonlySet<string>,
): string {
  if (!numero) return '-'
  const carte = cartes.find((c) => c.numero === numero)
  if (carte && revealedNumeros.has(carte.uuid || '')) return numero
  if (numero.length <= 4) return numero
  return '**** **** **** ' + numero.slice(-4)
}

/** Code PIN masqué (`****`), ou en clair s'il est révélé pour cette carte. */
export function maskCode(
  code: string | undefined,
  uuid: string | undefined,
  revealedCodes: ReadonlySet<string>,
): string {
  if (!code) return '-'
  if (uuid && revealedCodes.has(uuid)) return code
  return '****'
}

export type ExpirationStatus = {
  /** Couleur de l'icône (et de la date quand il n'y a pas de badge). */
  className: string
  badge: 'destructive' | 'warning' | null
  label: string
}

const shortDateFormat: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

/** Statut d'expiration : « Expirée » si dépassée, « Expire bientôt » à moins de 30 jours. */
export function getExpirationStatus(dateExpiration?: string): ExpirationStatus | null {
  if (!dateExpiration) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expDate = new Date(dateExpiration)
  expDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { className: 'text-destructive', badge: 'destructive', label: 'Expirée' }
  }
  if (diffDays < 30) {
    return { className: 'text-orange-600', badge: 'warning', label: 'Expire bientôt' }
  }
  return {
    className: 'text-muted-foreground',
    badge: null,
    label: expDate.toLocaleDateString('fr-FR', shortDateFormat),
  }
}

/** « 25 sept. 2026 » */
export function formatExpirationDate(dateExpiration?: string): string {
  if (!dateExpiration) return '-'
  return new Date(dateExpiration).toLocaleDateString('fr-FR', shortDateFormat)
}

/** « 25 septembre 2026 » (colonne « Créé le » des types de cartes). */
export function formatLongDate(dateString?: string | Date): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « 25 sept. 2026, 14:30 » (bloc « Informations système » des formulaires). */
export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

/** Recherche sur le nom, la description, le numéro, le type et le titulaire (nom, e-mail). */
export function filterCartes(cartes: CarteDTO[], searchQuery: string): CarteDTO[] {
  if (!searchQuery.trim()) return cartes
  const query = searchQuery.toLowerCase()
  return cartes.filter(
    (carte) =>
      carte.nom?.toLowerCase().includes(query) ||
      carte.description?.toLowerCase().includes(query) ||
      carte.numero?.toLowerCase().includes(query) ||
      carte.typeCarte?.nom?.toLowerCase().includes(query) ||
      carte.user?.firstName?.toLowerCase().includes(query) ||
      carte.user?.lastName?.toLowerCase().includes(query) ||
      carte.user?.email?.toLowerCase().includes(query),
  )
}

/** Recherche sur le nom et la description d'un type de carte. */
export function filterTypesCartes(types: TypeCarteDTO[], searchQuery: string): TypeCarteDTO[] {
  if (!searchQuery.trim()) return types
  const query = searchQuery.toLowerCase()
  return types.filter(
    (type) =>
      type.nom?.toLowerCase().includes(query) || type.description?.toLowerCase().includes(query),
  )
}

/** Libellé d'un utilisateur dans le sélecteur du formulaire de carte. */
export const userOptionLabel = (user: UserDTO) =>
  `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur inconnu'
