import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userServicesService,
  type ServiceCreateRequest,
  type ServiceUpdateRequest,
} from '@/services/userServices'
import type { AdminServicePayload } from '../lib/serviceForm'
import { invalidateUserServices } from './invalidateUserServices'

/**
 * Types locaux du service incomplets (ni `isBreak` ni coordonnées de fin) alors que l'API les
 * accepte et que le Vue les envoyait : on élargit le type sans toucher au service.
 */
type CreateRequest = ServiceCreateRequest & Partial<AdminServicePayload>
type UpdateRequest = ServiceUpdateRequest & Partial<AdminServicePayload>

/** Création d'un pointage pour un employé (POST /services/admin/create). */
export function useCreateAdminServiceMutation(userUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdminServicePayload) => {
      const request: CreateRequest = { userUuid, ...payload }
      return userServicesService.createService(request)
    },
    onSuccess: () => invalidateUserServices(queryClient, userUuid),
  })
}

type UpdateAdminServiceVariables = {
  serviceUuid: string
  payload: AdminServicePayload
}

/** Modification d'un pointage (PUT /services/admin/{uuid}). */
export function useUpdateAdminServiceMutation(userUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ serviceUuid, payload }: UpdateAdminServiceVariables) => {
      const request: UpdateRequest = payload
      return userServicesService.validateService(serviceUuid, request)
    },
    onSuccess: () => invalidateUserServices(queryClient, userUuid),
  })
}

/** Suppression d'un pointage (DELETE /services/admin/{uuid}). */
export function useDeleteAdminServiceMutation(userUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceUuid: string) => userServicesService.deleteService(serviceUuid),
    onSuccess: () => invalidateUserServices(queryClient, userUuid),
  })
}
