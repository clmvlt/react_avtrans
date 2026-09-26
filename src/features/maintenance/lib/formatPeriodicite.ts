import type { VehiculeTypeEntretienDTO } from '@/models'

/**
 * Périodicité lisible d'une configuration (EntretiensVehicule.vue) : « 1 an et 30 jours »,
 * « 3 mois » (mois approximé à 30 jours, comme le Vue), « 15 jours » ou « 30 000 km ».
 */
export function formatPeriodicite(config: VehiculeTypeEntretienDTO): string {
  if (!config.periodiciteValeur) return ''
  if (config.periodiciteType === 'TEMPOREL') {
    const jours = config.periodiciteValeur
    if (jours >= 365) {
      const annees = Math.floor(jours / 365)
      const resteJours = jours % 365
      const anneesText = `${annees} an${annees > 1 ? 's' : ''}`
      if (resteJours === 0) return anneesText
      return `${anneesText} et ${resteJours} jour${resteJours > 1 ? 's' : ''}`
    }
    if (jours >= 30) return `${Math.floor(jours / 30)} mois`
    return `${jours} jour${jours > 1 ? 's' : ''}`
  }
  return `${config.periodiciteValeur.toLocaleString('fr-FR')} km`
}
