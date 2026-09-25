import { useQuery } from '@tanstack/react-query'
import type { AppVersionDTO } from '@/models'
import { appVersionsService } from '@/services'
import { appVersionKeys } from './queryKeys'

async function fetchAppVersion(id: string): Promise<AppVersionDTO> {
  const response = await appVersionsService.getVersionById(id)
  if (response.success && response.version) return response.version
  throw new Error('Version non trouvée')
}

/**
 * Une version (GET /app-versions/{id}) pour le dialog de modification. Comme le Vue, elle est
 * rechargée à chaque ouverture : `gcTime: 0` oublie la réponse dès que le dialog est fermé.
 */
export function useAppVersionQuery(id: string) {
  return useQuery({
    queryKey: appVersionKeys.detail(id),
    queryFn: () => fetchAppVersion(id),
    enabled: !!id,
    gcTime: 0,
  })
}
