import { useRef, useState, type TouchEvent } from 'react'

type UseSwipeOptions = {
  /** Désactive la détection (ex. image zoomée). */
  disabled?: boolean
  /** Balayage vers la gauche (doigt qui part à gauche). */
  onSwipeLeft?: () => void
  /** Balayage vers la droite. */
  onSwipeRight?: () => void
  /** Balayage vers le bas. */
  onSwipeDown?: () => void
  /** Distance horizontale minimale en px (50 par défaut). */
  horizontalThreshold?: number
  /** Distance verticale minimale vers le bas en px (100 par défaut). */
  downThreshold?: number
}

/**
 * Détection de balayage tactile (ImageLightbox) : horizontal pour naviguer, vers le bas pour fermer.
 * Renvoie le déplacement en cours (`delta`) pour faire suivre l'élément au doigt, et les
 * gestionnaires à poser sur l'élément.
 *
 * @example
 * const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev, onSwipeDown: close })
 * <div {...swipe.handlers} style={{ transform: `translateX(${swipe.delta.x}px)` }} />
 */
export function useSwipe({
  disabled = false,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  horizontalThreshold = 50,
  downThreshold = 100,
}: UseSwipeOptions = {}) {
  const start = useRef({ x: 0, y: 0 })
  const [isSwiping, setIsSwiping] = useState(false)
  const [delta, setDelta] = useState({ x: 0, y: 0 })

  const onTouchStart = (event: TouchEvent) => {
    if (disabled) return
    const touch = event.touches[0]
    if (!touch) return
    start.current = { x: touch.clientX, y: touch.clientY }
    setDelta({ x: 0, y: 0 })
    setIsSwiping(true)
  }

  const onTouchMove = (event: TouchEvent) => {
    if (!isSwiping) return
    const touch = event.touches[0]
    if (!touch) return
    setDelta({ x: touch.clientX - start.current.x, y: touch.clientY - start.current.y })
  }

  const onTouchEnd = () => {
    if (!isSwiping) return
    setIsSwiping(false)
    const absX = Math.abs(delta.x)
    const absY = Math.abs(delta.y)
    if (absX > horizontalThreshold && absX > absY) {
      if (delta.x < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    } else if (delta.y > downThreshold && absY > absX) {
      onSwipeDown?.()
    }
    setDelta({ x: 0, y: 0 })
  }

  return {
    isSwiping,
    delta,
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
  }
}
