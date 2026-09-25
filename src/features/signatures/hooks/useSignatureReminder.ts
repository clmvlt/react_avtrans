import { useSignatureSummaryQuery } from '../api/useSignatureSummaryQuery'

/**
 * Rappel de signature des heures (port de `useSignatureReminder.ts`) : à afficher quand le
 * backend demande une signature (`needsToSign`) et que l'utilisateur a des heures le mois dernier.
 * Tout est dérivé du résumé en cache : la signature enregistrée le met à jour, la déconnexion
 * vide le cache (équivalents de `markSigned` et `reset`).
 */
export function useSignatureReminder() {
  const { data } = useSignatureSummaryQuery()
  const heuresLastMonth = data?.heuresLastMonth ?? 0
  const show = !!data?.needsToSign && heuresLastMonth > 0

  return { show, heuresLastMonth }
}
