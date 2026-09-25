import { useQuery } from '@tanstack/react-query'
import type { AppVersionDTO, AppVersionListResponse } from '@/models'
import { appVersionsService } from '@/services'
import { sortByVersionCodeDesc } from '../lib/appVersionList'
import { appVersionKeys } from './queryKeys'

const toSortedVersions = (response: AppVersionListResponse): AppVersionDTO[] =>
  sortByVersionCodeDesc(response.versions || [])

/** Toutes les versions, actives ou non (GET /app-versions/admin), triées par build décroissant. */
export function useAdminAppVersionsQuery() {
  return useQuery({
    queryKey: appVersionKeys.admin(),
    queryFn: () => appVersionsService.getAllVersions(),
    select: toSortedVersions,
  })
}
