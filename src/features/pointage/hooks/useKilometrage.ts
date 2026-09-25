import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAddKilometrageMutation } from '@/features/vehicles/api/useAddKilometrageMutation'
import type { UserLastKilometrageResponse } from '@/models'
import { selectIsUser, useAuthStore } from '@/stores/auth-store'
import { pointageKeys } from '../api/queryKeys'
import { useMyLastKilometrageQuery } from '../api/useMyLastKilometrageQuery'
import type { KilometrageInput } from '../schemas/kilometrage'

type DialogState = {
  open: boolean
  /** Saisie obligatoire avant « Démarrer » : dialog impossible à fermer */
  required: boolean
}

/**
 * Kilométrage du jour (Pointage.vue) : obligation pour le rôle **Utilisateur** (rôle réel, la
 * « vue utilisateur » d'un admin n'a pas d'effet), état du dialog et enregistrement du relevé.
 * Admin et mécanicien n'ont pas d'obligation ; une erreur de lecture ne bloque personne.
 */
export function useKilometrage() {
  const isUserRole = useAuthStore(selectIsUser)
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<DialogState>({ open: false, required: false })
  const lastKmQuery = useMyLastKilometrageQuery({ enabled: isUserRole || dialog.open })
  const addKilometrage = useAddKilometrageMutation()

  const hasEnteredToday =
    !isUserRole || lastKmQuery.isError || lastKmQuery.data?.hasEnteredToday === true

  const openDialog = (required: boolean) => {
    // Message d'erreur précédent effacé à l'ouverture (sans perdre un enregistrement en cours)
    if (!addKilometrage.isPending) addKilometrage.reset()
    setDialog({ open: true, required })
  }

  const onOpenChange = (open: boolean) => {
    if (!open && dialog.required) return
    setDialog((current) => ({ ...current, open }))
  }

  /** Enregistre le relevé ; si la saisie était obligatoire, `onRequiredSaved` démarre le service. */
  const save = (values: KilometrageInput, onRequiredSaved: () => void) => {
    const wasRequired = dialog.required
    addKilometrage.mutate(values, {
      onSuccess: () => {
        queryClient.setQueryData<UserLastKilometrageResponse>(
          pointageKeys.lastKilometrage(),
          (current) => ({
            lastKilometrage: { ...current?.lastKilometrage, ...values },
            hasEnteredToday: true,
          }),
        )
        void queryClient.invalidateQueries({ queryKey: pointageKeys.lastKilometrage() })
        setDialog((current) => ({ ...current, open: false }))
        toast.success('Kilométrage enregistré avec succès', { duration: 5000 })
        if (wasRequired) onRequiredSaved()
      },
    })
  }

  const saveError = addKilometrage.error

  return {
    dialog,
    openDialog,
    onOpenChange,
    /** Rôle Utilisateur sans kilométrage saisi aujourd'hui */
    mustEnterToday: !hasEnteredToday,
    /** Statut du jour pas encore connu (rôle Utilisateur) : la page attend, comme le Vue */
    isStatusLoading: isUserRole && lastKmQuery.isPending,
    /** Véhicule présélectionné : celui du dernier relevé */
    lastVehiculeId: lastKmQuery.data?.lastKilometrage?.vehiculeId ?? '',
    isLastVehiculeLoading: lastKmQuery.isLoading,
    save,
    isSaving: addKilometrage.isPending,
    saveErrorMessage: saveError
      ? saveError instanceof Error
        ? saveError.message
        : "Erreur lors de l'enregistrement du kilométrage"
      : '',
  }
}
