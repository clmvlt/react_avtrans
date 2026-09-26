import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dossiersTypesEntretienService } from '@/services'
import type { CreateDossierTypeEntretienRequest, UpdateDossierTypeEntretienRequest } from '@/models'
import { updateDossiersCache, updateTypesCache } from './typesCache'

/** POST /dossiers-types-entretien : le dossier renvoyé est ajouté en fin de liste. */
export function useCreateDossierMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDossierTypeEntretienRequest) =>
      dossiersTypesEntretienService.createDossier(data),
    onSuccess: (response) => {
      const created = response.dossier
      if (created) updateDossiersCache(queryClient, (dossiers) => [...dossiers, created])
    },
  })
}

type UpdateDossierVariables = {
  id: string
  data: UpdateDossierTypeEntretienRequest
}

/**
 * PUT /dossiers-types-entretien/{id} : le dossier renvoyé remplace l'ancien. Comme le Vue, le nom
 * du dossier recopié dans chaque type n'est pas mis à jour avant le prochain chargement.
 */
export function useUpdateDossierMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: UpdateDossierVariables) =>
      dossiersTypesEntretienService.updateDossier(id, data),
    onSuccess: (response, { id }) => {
      const updated = response.dossier
      if (updated) {
        updateDossiersCache(queryClient, (dossiers) =>
          dossiers.map((d) => (d.id === id ? updated : d)),
        )
      }
    },
  })
}

/** DELETE /dossiers-types-entretien/{id} : ses types passent localement dans « Non classés ». */
export function useDeleteDossierMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dossiersTypesEntretienService.deleteDossier(id),
    onSuccess: (_response, id) => {
      updateTypesCache(queryClient, (types) =>
        types.map((t) => (t.dossier?.id === id ? { ...t, dossier: undefined } : t)),
      )
      updateDossiersCache(queryClient, (dossiers) => dossiers.filter((d) => d.id !== id))
    },
  })
}
