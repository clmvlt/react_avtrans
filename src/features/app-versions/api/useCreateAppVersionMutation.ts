import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppVersionDTO, CreateAppVersionRequest } from '@/models'
import { appVersionsService } from '@/services'
import { appVersionKeys } from './queryKeys'

async function createAppVersion(data: CreateAppVersionRequest): Promise<AppVersionDTO> {
  const response = await appVersionsService.createVersion(data)
  if (response.success && response.version) return response.version
  throw new Error(response.message || 'Erreur lors de la création')
}

/**
 * Crée une version (POST /app-versions). L'APK part en base64 dans du JSON, avec le timeout de
 * 30 s du client : limite connue de l'API (MIGRATION.md 8.3, Q-UPLOAD), conservée.
 */
export function useCreateAppVersionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: appVersionKeys.create(),
    mutationFn: createAppVersion,
    // Le dialog reste « en cours » jusqu'à l'arrivée de la liste à jour
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appVersionKeys.all }),
  })
}
