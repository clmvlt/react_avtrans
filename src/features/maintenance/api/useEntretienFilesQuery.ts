import { useQuery } from '@tanstack/react-query'
import { entretiensService, type EntretienFilesResponse } from '@/services'
import { maintenanceKeys } from './queryKeys'

const toFiles = (response: EntretienFilesResponse) => response.files ?? []

type UseEntretienFilesQueryOptions = {
  enabled?: boolean
}

/**
 * Fichiers d'un entretien avec leur contenu base64 (GET /entretiens/{id}/files). Chargés à
 * l'ouverture du dialog des fichiers ou du formulaire de modification. Comme le Vue, une erreur
 * équivaut à une liste vide (« Aucun fichier attaché »).
 */
export function useEntretienFilesQuery(
  entretienId: string | undefined,
  { enabled = true }: UseEntretienFilesQueryOptions = {},
) {
  return useQuery({
    queryKey: maintenanceKeys.files(entretienId ?? ''),
    queryFn: () => entretiensService.getEntretienFiles(entretienId!),
    select: toFiles,
    enabled: enabled && !!entretienId,
  })
}
