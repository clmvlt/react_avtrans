import type { VehiculeDTO, VehiculeRelaiDTO, VehiculeRelaiStatut } from '@/models'
import { formatDateShort } from './formatters'

/**
 * Véhicules relais (D9) : un relais remplace temporairement un véhicule (garage, panne…). Pendant
 * sa période, dates incluses, l'API range les relevés km saisis sur le véhicule dans le relais.
 */

export const RELAI_STATUT_LABELS: Record<VehiculeRelaiStatut, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
}

/** Motifs proposés à la saisie (texte libre accepté). */
export const RELAI_MOTIFS = ['Garage', 'Entretien', 'Panne', 'Sinistre', 'Contrôle technique']

/** « Renault Master », « Renault », '' sans marque ni modèle. */
export function describeRelaiVehicle(relai: Pick<VehiculeRelaiDTO, 'marque' | 'modele'>): string {
  return [relai.marque, relai.modele].filter(Boolean).join(' ')
}

/** « du 14 sept. 2026 au 18 sept. 2026 », « depuis le 14 sept. 2026 », « à partir du … ». */
export function formatRelaiPeriode(
  relai: Pick<VehiculeRelaiDTO, 'dateDebut' | 'dateFin' | 'statut'>,
): string {
  const debut = formatDateShort(relai.dateDebut)
  if (!relai.dateFin) {
    return relai.statut === 'A_VENIR' ? `à partir du ${debut}` : `depuis le ${debut}`
  }
  if (relai.dateFin === relai.dateDebut) return `le ${debut}`
  return `du ${debut} au ${formatDateShort(relai.dateFin)}`
}

/** Kilométrage actuel d'un relais : dernier relevé saisi pendant le relais, sinon km au départ. */
export function getRelaiCurrentKm(relai: VehiculeRelaiDTO): number | null {
  return relai.latestKm ?? relai.kmDebut ?? null
}

/**
 * Kilométrage du véhicule lui-même. Pendant un relais, `latestKm` est celui du relais (compteur
 * que les autres applications comparent à la saisie du chauffeur) : on lit `vehiculeLatestKm`.
 * Si l'API ne renvoie pas encore ce champ, `latestKm` est toujours celui du véhicule.
 */
export function getVehicleOwnKm(vehicule: VehiculeDTO): {
  km: number | undefined
  date: Date | string | undefined
} {
  if (vehicule.vehiculeLatestKm !== undefined) {
    return {
      km: vehicule.vehiculeLatestKm ?? undefined,
      date: vehicule.vehiculeLatestKmDate ?? undefined,
    }
  }
  return { km: vehicule.latestKm, date: vehicule.latestKmDate }
}

/**
 * Ancienne plaque relais saisie à la main, sans relais déclaré (avant D9) : l'API la renvoie dans
 * `relaiImmat` tant qu'aucun relais n'a été déclaré pour le véhicule.
 */
export function getLegacyRelaiImmat(vehicule: VehiculeDTO): string | null {
  return vehicule.relaiImmat && !vehicule.relaiEnCours ? vehicule.relaiImmat : null
}
