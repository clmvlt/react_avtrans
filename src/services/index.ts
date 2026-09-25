/**
 * Central export file for all services
 *
 * This file exports all API services and their singleton instances
 * for easy importing throughout the application.
 *
 * Usage:
 * ```typescript
 * import { authService, usersService } from '@/services'
 *
 * // Use the service
 * const users = await usersService.getUsers()
 * ```
 */

// Auth service
export * from './auth'
export { authService } from './auth'

// User management services
export * from './users'
export { usersService } from './users'

export * from './profile'
export { profileService } from './profile'

// Geocoding service (API externe ors.stack.bzh — autocomplétion d'adresse BAN)
export * from './geocoding'
export { geocodingService } from './geocoding'

// Time tracking service
export * from './userServices'
export { userServicesService } from './userServices'

// Vehicle services
export * from './vehicles'
export { vehiclesService } from './vehicles'

// Maintenance services
export * from './entretiens'
export { entretiensService } from './entretiens'

export * from './typesEntretien'
export { typesEntretienService } from './typesEntretien'

export * from './dossiersTypesEntretien'
export { dossiersTypesEntretienService } from './dossiersTypesEntretien'

export * from './vehiculesTypesEntretien'
export { vehiculesTypesEntretienService } from './vehiculesTypesEntretien'

// Absence services
export * from './absences'
export { absencesService } from './absences'

export * from './absenceTypes'
export { absenceTypesService } from './absenceTypes'

// Acompte service
export * from './acomptes'
export { acomptesService } from './acomptes'

// Notification service
export * from './notifications'
export { notificationsService } from './notifications'

// Signature service
export * from './signatures'
export { signaturesService } from './signatures'

// Report service
export * from './rapports'
export { rapportsService } from './rapports'

// Couchette service
export * from './couchettes'
export { couchettesService } from './couchettes'

// Export service
export * from './export'
export { exportService } from './export'

// Todo service
export * from './todos'
export { todosService } from './todos'

// App Versions service
export * from './appVersions'
export { appVersionsService } from './appVersions'

// Cartes services
export * from './typeCartes'
export { typeCartesService } from './typeCartes'

export * from './cartes'
export { cartesService } from './cartes'

// Stock services
export * from './stockItems'
export { stockItemsService } from './stockItems'

export * from './stockCategories'
export { stockCategoriesService } from './stockCategories'

// Vehicle equipment service
export * from './vehiculeEquipements'
export { vehiculeEquipementsService } from './vehiculeEquipements'
