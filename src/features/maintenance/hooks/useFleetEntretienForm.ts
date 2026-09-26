import { useRef, useState } from 'react'
import type { TypeEntretienDTO } from '@/models'
import { getTodayDate } from '@/utils/timeFormatters'
import { toLocalDateInput } from '../lib/entretienDates'
import type { EntretienRow } from '../lib/entretienRow'
import type { FleetEntretienFormValues } from '../schemas/entretienForm'

type FleetEntretienFormState = {
  open: boolean
  /** Change à chaque ouverture : le formulaire repart de `defaultValues`. */
  key: number
  /** Entretien modifié ; `null` en création. */
  entretien: EntretienRow | null
  defaultValues: FleetEntretienFormValues
}

const EMPTY_VALUES: FleetEntretienFormValues = {
  vehiculeId: '',
  dossierId: '',
  typeEntretienId: '',
  dateEntretien: '',
  kilometrage: '',
  cout: '',
  commentaire: '',
}

/**
 * Ouverture du formulaire d'entretien d'Entretiens.vue (création ou modification).
 *
 * Bug B-05 reproduit (Entretiens.vue:1418) : dans le Vue, un watcher vide le type dès que le
 * dossier du formulaire change. À l'ouverture en modification, le type est donc effacé si le
 * dossier de l'entretien diffère du dossier resté dans le formulaire précédent (y compris celui
 * choisi puis abandonné dans le sélecteur). On garde ce dossier précédent dans une ref, mise à
 * jour à chaque ouverture et à chaque changement de dossier dans le sélecteur.
 */
export function useFleetEntretienForm(types: TypeEntretienDTO[]) {
  const [state, setState] = useState<FleetEntretienFormState>({
    open: false,
    key: 0,
    entretien: null,
    defaultValues: EMPTY_VALUES,
  })
  const previousDossierIdRef = useRef('')

  const openCreate = () => {
    previousDossierIdRef.current = ''
    setState((current) => ({
      open: true,
      key: current.key + 1,
      entretien: null,
      // Bug B-01 reproduit : date du jour calculée en UTC (la veille entre 0 h et 2 h)
      defaultValues: { ...EMPTY_VALUES, dateEntretien: getTodayDate() },
    }))
  }

  const openEdit = (entretien: EntretienRow) => {
    const typeId = entretien.typeEntretien?.id || ''
    const dossierId = types.find((t) => t.id === typeId)?.dossier?.id || ''
    const typeEntretienId = dossierId !== previousDossierIdRef.current ? '' : typeId
    previousDossierIdRef.current = dossierId
    setState((current) => ({
      open: true,
      key: current.key + 1,
      entretien,
      defaultValues: {
        vehiculeId: entretien.vehiculeId || '',
        dossierId,
        typeEntretienId,
        dateEntretien: toLocalDateInput(entretien.dateEntretien),
        kilometrage: entretien.kilometrage != null ? String(entretien.kilometrage) : '',
        cout: entretien.cout != null ? String(entretien.cout) : '',
        commentaire: entretien.commentaire || '',
      },
    }))
  }

  return {
    ...state,
    openCreate,
    openEdit,
    /** Le sélecteur de type a changé de dossier (suivi pour B-05). */
    onDossierChange: (dossierId: string) => {
      previousDossierIdRef.current = dossierId
    },
    onOpenChange: (open: boolean) => {
      if (!open) setState((current) => ({ ...current, open: false }))
    },
  }
}
