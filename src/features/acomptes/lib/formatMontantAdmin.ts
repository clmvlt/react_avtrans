/**
 * Montant en euros **côté admin** (Acomptes.vue, AcompteDetailModal, AcompteValidateModal,
 * AcompteDeleteModal) : toujours 2 décimales, « 0,00 € » si absent. Les pages employé utilisent
 * `formatMontant` de `utils/acompteFormatters` (0 à 2 décimales, « 0 € »). Écart du Vue conservé.
 */
export function formatMontantAdmin(montant?: number | null): string {
  if (montant === null || montant === undefined) return '0,00 €'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
}
