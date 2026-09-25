/**
 * Message d'une erreur d'API (`ApiError` porte le message du serveur), sinon le texte de repli :
 * même règle que les `catch` du Vue (`err instanceof Error ? err.message : '…'`).
 */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
