/**
 * Durées de contrat usuelles du transport routier (D8, MIGRATION.md) : heures mensuelles et leur
 * équivalent hebdomadaire (durées d'équivalence du Code des transports, art. D3312-45).
 */
export const CONTRACT_PRESETS = [
  { value: '151.67', label: '151,67 h', hint: '35 h/sem.' },
  { value: '169', label: '169 h', hint: '39 h/sem. · courte distance' },
  { value: '186', label: '186 h', hint: '43 h/sem. · grands routiers' },
] as const

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

/**
 * Aide du champ « Heures mensuelles du contrat » : équivalent hebdomadaire (× 12 / 52, comme le
 * calcul des heures d'absence de l'API) quand la valeur saisie est valide.
 */
export function contractHoursHint(value: string): string {
  const monthly = Number.parseFloat(value)
  if (!Number.isFinite(monthly) || monthly <= 0) {
    return 'Heures contractuelles par mois. Sans contrat, les absences ne créditent aucune heure.'
  }
  const weekly = (monthly * 12) / 52
  return `Soit ${numberFormat.format(weekly)} h par semaine : base des heures créditées par les absences.`
}
