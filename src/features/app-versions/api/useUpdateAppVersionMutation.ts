import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppVersionDTO, UpdateAppVersionRequest } from '@/models'
import { appVersionsService } from '@/services'
import { appVersionKeys } from './queryKeys'

type UpdateAppVersionVariables = {
  id: string
  data: UpdateAppVersionRequest
}

async function updateAppVersion({ id, data }: UpdateAppVersionVariables): Promise<AppVersionDTO> {
  const response = await appVersionsService.updateVersion(id, data)
  if (response.success && response.version) return response.version
  throw new Error(response.message || 'Erreur lors de la modification')
}

/** Modifie les notes et le statut d'une version (PUT /app-versions/{id}). */
export function useUpdateAppVersionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: appVersionKeys.update(),
    mutationFn: updateAppVersion,
    // Listes seulement : le détail est rechargé à chaque ouverture du dialog
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: appVersionKeys.admin() }),
        queryClient.invalidateQueries({ queryKey: appVersionKeys.active() }),
      ]),
  })
}
