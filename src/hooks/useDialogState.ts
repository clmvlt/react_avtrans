import { useState } from 'react'

type DialogStateValue<TType extends string, TItem> = {
  type: TType
  item: TItem | null
  open: boolean
}

/**
 * État des dialogs d'une page qui en a plusieurs sur une même entité (modifier, supprimer,
 * fichiers…) : un seul dialog ouvert à la fois, avec l'élément concerné.
 *
 * À la fermeture, `type` et `item` sont conservés (seul `open` repasse à false) : le contenu reste
 * affiché pendant l'animation de sortie au lieu de se vider.
 *
 * @example
 * const dialogs = useDialogState<'edit' | 'delete', VehiculeDTO>()
 * dialogs.open('delete', vehicule)
 * <ConfirmDialog
 *   open={dialogs.isOpen('delete')}
 *   onOpenChange={dialogs.onOpenChange}
 *   title={`Supprimer ${dialogs.item?.immat}`}
 *   …
 * />
 */
export function useDialogState<TType extends string, TItem = never>() {
  const [state, setState] = useState<DialogStateValue<TType, TItem> | null>(null)

  const open = (type: TType, item: TItem | null = null) => setState({ type, item, open: true })
  const close = () => setState((current) => (current ? { ...current, open: false } : null))

  return {
    /** Type du dialog ouvert (ou du dernier ouvert, pendant sa fermeture). */
    type: state?.type ?? null,
    /** Élément du dialog ouvert (ou du dernier ouvert, pendant sa fermeture). */
    item: state?.item ?? null,
    /** `true` si le dialog `type` est ouvert. */
    isOpen: (type: TType) => state?.open === true && state.type === type,
    open,
    close,
    /** À passer tel quel à `onOpenChange` d'un Dialog : ferme sur `false`. */
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) close()
    },
  }
}
