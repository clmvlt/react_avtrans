/** Message d'une erreur d'API (`ApiError`), sinon le message par défaut du Vue. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
