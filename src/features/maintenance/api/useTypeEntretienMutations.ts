import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  typesEntretienService,
  type TypeEntretienCreateRequest,
  type TypeEntretienUpdateRequest,
} from '@/services'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'
import { updateTypesCache } from './typesCache'

/** POST /types-entretien : le type renvoyé est ajouté en fin de liste. */
export function useCreateTypeEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TypeEntretienCreateRequest) => typesEntretienService.createType(data),
    onSuccess: (response) => {
      const created = response.typeEntretien ?? response.data
      if (created) updateTypesCache(queryClient, (types) => [...types, created])
    },
  })
}

type UpdateTypeEntretienVariables = {
  id: string
  data: TypeEntretienUpdateRequest
}

/**
 * PUT /types-entretien/{id} depuis le formulaire : le type renvoyé remplace l'ancien.
 * L'API ignore les champs absents : un dossier ou une description vidés restent inchangés
 * (MIGRATION.md 8.3).
 */
export function useUpdateTypeEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: UpdateTypeEntretienVariables) =>
      typesEntretienService.updateType(id, data),
    onSuccess: (response, { id }) => {
      const updated = response.typeEntretien ?? response.data
      if (updated) {
        updateTypesCache(queryClient, (types) => types.map((t) => (t.id === id ? updated : t)))
      }
    },
  })
}

type MoveTypeEntretienVariables = {
  type: TypeEntretienDTO
  /** Dossier cible ; `undefined` = « Non classés ». */
  dossier: DossierTypeEntretienDTO | undefined
}

/**
 * Glisser-déposer d'un type vers un dossier : PUT `{ dossierId }`, ou `{}` pour « Non classés ».
 * La liste est mise à jour localement comme dans le Vue, sans rechargement. Vers « Non classés »,
 * l'API ignore la demande mais le type est affiché déplacé jusqu'au prochain chargement
 * (MIGRATION.md 8.3, reproduit).
 */
export function useMoveTypeEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, dossier }: MoveTypeEntretienVariables) =>
      typesEntretienService.updateType(type.id!, dossier?.id ? { dossierId: dossier.id } : {}),
    onSuccess: (_response, { type, dossier }) =>
      updateTypesCache(queryClient, (types) =>
        types.map((t) => (t.id === type.id ? { ...type, dossier } : t)),
      ),
  })
}

/** DELETE /types-entretien/{id}. */
export function useDeleteTypeEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => typesEntretienService.deleteType(id),
    onSuccess: (_response, id) =>
      updateTypesCache(queryClient, (types) => types.filter((t) => t.id !== id)),
  })
}
