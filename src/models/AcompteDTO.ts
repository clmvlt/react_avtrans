import type { UserDTO } from './UserDTO';

/**
 * Acompte DTO
 */
export interface AcompteDTO {
  uuid?: string;
  userUuid?: string;
  user?: UserDTO;
  montant?: number;
  raison?: string;
  status?: string;
  validatedByUuid?: string;
  validatedBy?: UserDTO;
  validatedAt?: Date | string;
  rejectionReason?: string;
  isPaid?: boolean;
  paidDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Acompte create request
 */
export interface AcompteCreateRequest {
  montant: number;
  raison?: string;
}

/**
 * Acompte update request
 */
export interface AcompteUpdateRequest {
  montant?: number;
  raison?: string;
  isPaid?: boolean;
}

/**
 * Acompte validation request
 */
export interface AcompteValidationRequest {
  approved: boolean;
  rejectionReason?: string;
}

/**
 * Acompte search request
 */
export interface AcompteSearchRequest {
  startDate?: string;
  endDate?: string;
  status?: string;
  montantMin?: number;
  montantMax?: number;
  userUuid?: string;
  isPaid?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
