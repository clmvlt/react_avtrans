import type { AbsenceDialogType } from '@/features/absences/components/admin/AbsenceDialogs'
import type { AcompteDialogType } from '@/features/acomptes/components/admin/AcompteDialogs'
import { useServiceDialogs } from '@/features/user-services/hooks/useServiceDialogs'
import { useDialogState } from '@/hooks/useDialogState'
import type { AbsenceDTO, AcompteDTO, CouchetteDTO, UserDTO } from '@/models'

export type AccountDialogType = 'edit' | 'email' | 'delete'

/**
 * Dialogs de la fiche, par domaine (un seul ouvert à la fois dans chaque domaine) : pointages,
 * absences, acomptes, couchettes et compte. Partagés par l'en-tête (« Ajouter », « ⋮ »), l'aperçu
 * et les onglets.
 */
export function useHubDialogs() {
  return {
    services: useServiceDialogs(),
    absences: useDialogState<AbsenceDialogType, AbsenceDTO>(),
    acomptes: useDialogState<AcompteDialogType, AcompteDTO>(),
    couchettes: useDialogState<'create' | 'delete', CouchetteDTO>(),
    account: useDialogState<AccountDialogType, UserDTO>(),
  }
}

export type HubDialogs = ReturnType<typeof useHubDialogs>
