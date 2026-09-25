/**
 * Types pour l'API de géocodage (ors.stack.bzh — index BAN)
 */

/**
 * Un résultat d'adresse renvoyé par GET /geocoding/search.
 * - type=street : agrégation au niveau de la voie (pas de numéro)
 * - type=housenumber : adresse précise (numéro de voie)
 */
export interface AddressResult {
  /** Libellé complet prêt à afficher, ex: "12 Rue du Bocage, 35000 Rennes" */
  label: string
  /** Numéro de voie (vide si type=street) */
  houseNumber: string
  /** Nom de la voie, ex: "Rue du Bocage" */
  street: string
  /** Code postal */
  postcode: string
  /** Commune */
  city: string
  /** Latitude WGS84 */
  lat: number
  /** Longitude WGS84 */
  lon: number
  /** "street" (voie) ou "housenumber" (adresse précise) */
  type: string
  /** Distance en mètres si un biais de proximité (lat/lon) a été fourni, sinon null */
  distanceMeters: number | null
  /** Score de pertinence Lucene */
  score: number
}

/**
 * État de l'index d'adresses (GET /geocoding/status)
 */
export interface GeocodingStatus {
  ready: boolean
}
