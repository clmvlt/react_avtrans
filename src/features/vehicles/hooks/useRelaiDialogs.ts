import { useState } from 'react'
import { useDialogState } from '@/hooks/useDialogState'
import type { VehiculeRelaiDTO } from '@/models'

export type RelaiDialogType = 'form' | 'end' | 'delete'

/** Actions sur les relais, partagées par la carte de la fiche et l'onglet « Relais » (D9). */
export type RelaiActions = {
  /** Déclarer un relais, plaque éventuellement préremplie (ancienne plaque relais). */
  declare: (defaultImmat?: string) => void
  edit: (relai: VehiculeRelaiDTO) => void
  end: (relai: VehiculeRelaiDTO) => void
  remove: (relai: VehiculeRelaiDTO) => void
}

/**
 * État des dialogs des relais d'un véhicule : un seul ouvert à la fois, tenu par la page de
 * détail pour que la carte « Véhicule relais » et l'onglet « Relais » ouvrent les mêmes dialogs.
 */
export function useRelaiDialogs() {
  const dialogs = useDialogState<RelaiDialogType, VehiculeRelaiDTO>()
  const [defaultImmat, setDefaultImmat] = useState<string | undefined>(undefined)

  const actions: RelaiActions = {
    declare: (immat) => {
      setDefaultImmat(immat)
      dialogs.open('form')
    },
    edit: (relai) => {
      setDefaultImmat(undefined)
      dialogs.open('form', relai)
    },
    end: (relai) => dialogs.open('end', relai),
    remove: (relai) => dialogs.open('delete', relai),
  }

  return { dialogs, defaultImmat, actions }
}
