/**
 * Comparateur générique du tri des colonnes de Users.vue (ordre croissant ; la table inverse le
 * résultat pour l'ordre décroissant) : essai en date (`Date.parse`), puis en nombre, puis
 * `localeCompare('fr')` insensible à la casse.
 *
 * Reproduit tel quel (bug B-19) : `Date.parse` est tenté avant tout, y compris sur les nombres
 * (0 et 1 passent pour les années 2000 et 2001) ; sans effet visible sur les colonnes actuelles.
 */
export function compareLikeVue(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  const aDate = Date.parse(String(a))
  const bDate = Date.parse(String(b))
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return aDate - bDate

  if (typeof a === 'number' && typeof b === 'number') return a - b

  return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), 'fr')
}
