import { useState } from 'react'
import type { ServiceDTO } from '@/models'
import {
  createServiceFormValues,
  editServiceFormValues,
  NO_COORDINATES,
  serviceCoordinates,
  type ServiceFormTarget,
} from '../lib/serviceForm'
import { getServiceLocation, type ServiceLocationDetails } from '../lib/serviceLocation'

type ServiceDialog =
  | { type: 'form'; target: ServiceFormTarget }
  | { type: 'delete'; service: ServiceDTO }
  | { type: 'location'; location: ServiceLocationDetails }

type DialogType = ServiceDialog['type']

/**
 * Dialogs des pointages d'un employé (un seul ouvert à la fois). Le contenu du dernier dialog reste
 * disponible pendant l'animation de fermeture.
 */
export function useServiceDialogs() {
  const [state, setState] = useState<{ dialog: ServiceDialog; open: boolean } | null>(null)

  const show = (dialog: ServiceDialog) => setState({ dialog, open: true })
  const close = () => setState((current) => (current ? { ...current, open: false } : null))
  const dialog = state?.dialog

  return {
    isOpen: (type: DialogType) => state?.open === true && state.dialog.type === type,
    /** À passer à `onOpenChange` : ferme sur `false`. */
    onOpenChange: (open: boolean) => {
      if (!open) close()
    },
    close,

    /** Nouveau pointage : maintenant, le jour donné ou aujourd'hui. */
    openCreate: (date?: string) =>
      show({
        type: 'form',
        target: {
          service: null,
          values: createServiceFormValues(date),
          coordinates: NO_COORDINATES,
        },
      }),
    openEdit: (service: ServiceDTO) =>
      show({
        type: 'form',
        target: {
          service,
          values: editServiceFormValues(service),
          coordinates: serviceCoordinates(service),
        },
      }),
    openDelete: (service: ServiceDTO) => show({ type: 'delete', service }),
    /** Bug B-26 reproduit : sans position valide (0,0), rien ne s'ouvre. */
    openLocation: (service: ServiceDTO) => {
      const location = getServiceLocation(service)
      if (location) show({ type: 'location', location })
    },

    formTarget: dialog?.type === 'form' ? dialog.target : null,
    serviceToDelete: dialog?.type === 'delete' ? dialog.service : null,
    location: dialog?.type === 'location' ? dialog.location : null,
  }
}
