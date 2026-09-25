/**
 * Utilitaires de formatage pour les acomptes
 */

/**
 * Formate un montant en euros (ex. « 1 500 € », « 250,50 € »)
 */
export function formatMontant(montant?: number | null): string {
  if (montant === null || montant === undefined || Number.isNaN(montant)) return '0 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(montant)
}

/**
 * Libellé français d'un statut d'acompte
 */
export function getAcompteStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING': return 'En attente'
    case 'APPROVED': return 'Approuvé'
    case 'REJECTED': return 'Refusé'
    case 'CANCELLED': return 'Annulé'
    default: return 'Inconnu'
  }
}

/**
 * Classes Tailwind (bordure, fond, texte) d'une pastille de statut d'acompte
 */
export function getAcompteStatusClasses(status?: string): string {
  switch (status) {
    case 'PENDING': return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'APPROVED': return 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
    case 'REJECTED': return 'border-destructive/40 bg-destructive/10 text-destructive'
    case 'CANCELLED': return 'border-border bg-muted text-muted-foreground'
    default: return 'border-border bg-muted text-muted-foreground'
  }
}
