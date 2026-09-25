import type { UserDTO } from './UserDTO';

/**
 * Signature DTO
 */
export interface SignatureDTO {
  uuid?: string;
  signatureBase64?: string;
  date?: Date | string;
  heuresSignees?: number;
  user?: UserDTO;
  createdAt?: Date | string;
}

/**
 * Signature create request — POST /signatures
 * Les 3 champs sont obligatoires en base mais non validés côté serveur
 * (champ manquant → 400 avec message technique Hibernate) : valider côté client.
 */
export interface SignatureCreateRequest {
  /** Data URI PNG de préférence (stocké et renvoyé tel quel) */
  signatureBase64: string;
  /** ISO 8601 avec offset (ZonedDateTime) */
  date: string;
  heuresSignees: number;
}

/**
 * Last signature summary DTO
 */
export interface LastSignatureSummaryDTO {
  date?: Date | string;
  heuresSignees?: number;
  needsToSign?: boolean;
  heuresLastMonth?: number;
}

/**
 * User with last signature DTO
 */
export interface UserWithLastSignatureDTO {
  user?: UserDTO;
  lastSignature?: SignatureDTO;
}
