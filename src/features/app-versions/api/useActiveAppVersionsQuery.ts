import { useQuery } from '@tanstack/react-query'
import type { AppVersionListResponse } from '@/models'
import { appVersionsService } from '@/services'
import { splitLatestVersion, type ActiveAppVersions } from '../lib/appVersionList'
import { appVersionKeys } from './queryKeys'

const toActiveVersions = (response: AppVersionListResponse): ActiveAppVersions =>
  splitLatestVersion(response.versions || [])

/** Versions actives (GET /app-versions, route publique) : la dernière et les précédentes. */
export function useActiveAppVersionsQuery() {
  return useQuery({
    queryKey: appVersionKeys.active(),
    queryFn: () => appVersionsService.getActiveVersions(),
    select: toActiveVersions,
  })
}
