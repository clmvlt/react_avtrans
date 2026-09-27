import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import {
  absencesService,
  type AbsenceDecompteRequest,
  type AbsenceDecompteResponse,
} from '@/services'
import { absenceKeys } from './queryKeys'

type DecompteOptions = {
  /** Attendre 300 ms après la dernière saisie (aperçu d'un formulaire). */
  debounce?: boolean
}

const toDecompte = (response: AbsenceDecompteResponse) => response.data

/**
 * Aperçu du décompte d'une absence (D8) : jours décomptés et heures créditées, jour par jour.
 * `my` : POST /absences/decompte (contrat de l'employé connecté) ; `admin` :
 * POST /absences/admin/decompte (userUuid obligatoire). Rien n'est demandé tant que `request`
 * vaut `null`.
 */
export function useAbsenceDecompteQuery(
  scope: 'my' | 'admin',
  request: AbsenceDecompteRequest | null,
  { debounce = false }: DecompteOptions = {},
) {
  // Chaîne stable pour l'anti-rebond (un objet neuf à chaque rendu relancerait le minuteur)
  const key = request ? JSON.stringify(request) : null
  const debouncedKey = useDebouncedValue(key, 300)
  const effectiveKey = debounce ? debouncedKey : key
  const params = effectiveKey ? (JSON.parse(effectiveKey) as AbsenceDecompteRequest) : null

  return useQuery({
    queryKey: absenceKeys.decompte(scope, params ?? { startDate: '', endDate: '' }),
    queryFn: params
      ? () =>
          scope === 'admin'
            ? absencesService.getDecompteForUser(params)
            : absencesService.getDecompte(params)
      : skipToken,
    select: toDecompte,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
