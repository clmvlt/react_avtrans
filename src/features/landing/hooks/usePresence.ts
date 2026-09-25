import { useState, type AnimationEvent } from 'react'

/**
 * Montage / démontage animé (équivalent de `<Transition>` + `v-if` du Vue) : l'élément reste
 * monté pendant son animation de sortie (`data-state="closed"` + `animate-out` de
 * tw-animate-css), puis est retiré à la fin de celle-ci. Fermé, il n'est pas dans le DOM
 * (donc absent du HTML pré-rendu), comme dans Landing.vue.
 */
export function usePresence(open: boolean) {
  const [present, setPresent] = useState(open)
  // Réouverture : on remonte immédiatement (mise à jour d'état pendant le rendu, sans effet)
  if (open && !present) setPresent(true)

  const onAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (!open && event.target === event.currentTarget) setPresent(false)
  }

  return {
    isMounted: open || present,
    state: open ? ('open' as const) : ('closed' as const),
    onAnimationEnd,
  }
}
