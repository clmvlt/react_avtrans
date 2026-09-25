import { ApiClient } from '@/api'
import type { AddressResult, GeocodingStatus } from '@/types/geocoding'

/**
 * URL de l'API de géocodage (ors.stack.bzh).
 * API 100 % locale réunissant routing / optimisation / geocoding (index BAN).
 */
const GEOCODING_API_URL =
  import.meta.env.VITE_GEOCODING_API_URL || 'https://ors.stack.bzh/'

/**
 * Client dédié à l'API de géocodage.
 * Indépendant du backend AVTRANS : pas de token JWT, pas d'interceptor 401.
 */
const geocodingClient = new ApiClient({
  baseURL: GEOCODING_API_URL,
  timeout: 10000,
})

/**
 * Paramètres de recherche d'adresse.
 */
export interface AddressSearchParams {
  /** Texte recherché (adresse, rue, ville…). L'autocomplétion s'applique au dernier mot. */
  q: string
  /** Nombre maximum de résultats (1 à 50). Défaut : 10 */
  limit?: number
  /** Latitude WGS84 de la position de référence (biais de proximité, optionnel). */
  lat?: number
  /** Longitude WGS84 de la position de référence (doit accompagner lat). */
  lon?: number
}

/**
 * Service de géocodage / autocomplétion d'adresse (Base Adresse Nationale).
 */
export class GeocodingService {
  /**
   * Recherche plein texte avec autocomplétion.
   * Renvoie les résultats les plus pertinents (triés par score décroissant).
   * Renvoie un tableau vide si la requête est trop courte ou si l'index est indisponible (503).
   */
  async search(params: AddressSearchParams): Promise<AddressResult[]> {
    const q = params.q?.trim()
    if (!q) return []

    const query: Record<string, string | number> = {
      q,
      limit: params.limit ?? 10,
    }
    if (params.lat != null && params.lon != null) {
      query.lat = params.lat
      query.lon = params.lon
    }

    try {
      return await geocodingClient.get<AddressResult[]>('geocoding/search', {
        params: query,
      })
    } catch {
      // Index indisponible (503) ou réseau : on dégrade silencieusement
      // pour ne pas bloquer la saisie manuelle de l'adresse.
      return []
    }
  }

  /**
   * État de l'index d'adresses (ready=true si /search est disponible).
   */
  async status(): Promise<GeocodingStatus> {
    return geocodingClient.get<GeocodingStatus>('geocoding/status')
  }
}

export const geocodingService = new GeocodingService()
