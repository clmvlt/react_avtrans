import { useQuery } from '@tanstack/react-query'
import { vehiclesService, type AdjustInfoPicturesListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toPictures = (response: AdjustInfoPicturesListResponse) => response.pictures ?? []

/**
 * Photos d'un commentaire (GET /vehicules/adjust-infos/{id}/pictures), chargées à l'ouverture
 * du dialog « Photos de l'ajustement ».
 */
export function useAdjustInfoPicturesQuery(adjustInfoId: string | null) {
  return useQuery({
    queryKey: vehiclesKeys.adjustInfoPictures(adjustInfoId ?? ''),
    queryFn: () => vehiclesService.getAdjustInfoPictures(adjustInfoId!),
    select: toPictures,
    enabled: !!adjustInfoId,
  })
}
