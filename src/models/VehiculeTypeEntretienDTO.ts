import { PeriodiciteType } from '../enums';
import type { TypeEntretienDTO } from './TypeEntretienDTO';

/**
 * Configuration d'entretien pour un véhicule spécifique
 */
export interface VehiculeTypeEntretienDTO {
  /** Identifiant unique */
  id?: string;
  /** Identifiant du véhicule */
  vehiculeId?: string;
  /** Immatriculation du véhicule */
  vehiculeImmat?: string;
  /** Type d'entretien générique */
  typeEntretien?: TypeEntretienDTO;
  /** Type de périodicité */
  periodiciteType?: PeriodiciteType;
  /** Valeur de la périodicité (km pour KILOMETRAGE, jours pour TEMPOREL) */
  periodiciteValeur?: number;
  /** Indique si la configuration est active */
  actif?: boolean;
  /** Date de création */
  createdAt?: Date | string;
}

/**
 * Requête de création d'une configuration d'entretien pour un véhicule
 */
export interface VehiculeTypeEntretienCreateRequest {
  /** Identifiant du véhicule */
  vehiculeId: string;
  /** Identifiant du type d'entretien */
  typeEntretienId: string;
  /** Type de périodicité */
  periodiciteType: PeriodiciteType;
  /** Valeur de la périodicité (km pour KILOMETRAGE, jours pour TEMPOREL) */
  periodiciteValeur: number;
}

/**
 * Requête de mise à jour d'une configuration d'entretien
 */
export interface VehiculeTypeEntretienUpdateRequest {
  /** Type de périodicité */
  periodiciteType?: PeriodiciteType;
  /** Valeur de la périodicité (km pour KILOMETRAGE, jours pour TEMPOREL) */
  periodiciteValeur?: number;
  /** Indique si la configuration est active */
  actif?: boolean;
}
