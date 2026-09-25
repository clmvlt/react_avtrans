import { Phone } from 'lucide-react'
import { PHONE_MAIN } from '../data/contact'
import { useFloatingCtaVisible } from '../hooks/useFloatingCtaVisible'
import { usePresence } from '../hooks/usePresence'

/**
 * Bouton d'appel flottant (bas droite), visible entre la fin du héro et la section contact.
 * Monte depuis le bas en 300 ms et redescend en 200 ms, comme la `<Transition>` du Vue ;
 * masqué, il est retiré du DOM. Durée et courbe passent par les propriétés `animation-*` (et non
 * `duration-*` / `ease-*`) pour ne pas modifier la transition du survol (`transition-all`).
 */
export function FloatingCallButton() {
  const visible = useFloatingCtaVisible()
  const { isMounted, state, onAnimationEnd } = usePresence(visible)
  if (!isMounted) return null

  return (
    <a
      href={PHONE_MAIN.href}
      data-state={state}
      onAnimationEnd={onAnimationEnd}
      className="fixed right-6 bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40 data-[state=closed]:animate-out data-[state=closed]:animation-duration-200 data-[state=closed]:fill-mode-forwards data-[state=closed]:[animation-timing-function:ease-in] data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:animation-duration-300 data-[state=open]:[animation-timing-function:ease-out] data-[state=open]:fade-in data-[state=open]:slide-in-from-bottom sm:px-6 sm:py-3.5"
    >
      <Phone className="size-5 animate-pulse" />
      <span className="hidden text-sm font-semibold sm:inline">Nous contacter</span>
    </a>
  )
}
