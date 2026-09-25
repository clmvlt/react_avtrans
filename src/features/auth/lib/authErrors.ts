import { ApiError } from '@/api'

/**
 * Message d'une erreur d'API sur les pages d'auth hors Google (`error.message || repli`).
 * Bug B-34 du Vue reproduit (MIGRATION.md 8.2) : « Network error » et « Request timeout »
 * restent en anglais.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return (error instanceof Error ? error.message : '') || fallback
}

/** Parcours Google : les erreurs réseau et les timeouts sont traduits (comme dans le Vue). */
export function getGoogleErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return 'Problème de connexion au serveur. Vérifiez votre réseau et réessayez.'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
