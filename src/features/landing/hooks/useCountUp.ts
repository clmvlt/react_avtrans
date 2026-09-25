import { useEffect, useRef, useState } from 'react'

/**
 * Compteurs animés de 0 à leur cible (ease-out cubique) dès que 30 % de l'élément référencé est
 * visible, une seule fois. `targets` doit être stable (constante de module).
 * Comme Landing.vue, l'animation ignore `prefers-reduced-motion` ; le pré-rendu attend sa fin
 * pour capturer les valeurs finales.
 */
export function useCountUp<T extends HTMLElement>(targets: readonly number[], durationMs: number) {
  const ref = useRef<T>(null)
  const [values, setValues] = useState(() => targets.map(() => 0))

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let rafId: number | null = null
    const animate = () => {
      const startTime = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / durationMs, 1)
        const eased = 1 - Math.pow(1 - t, 3) // ease-out cubique
        setValues(targets.map((target) => Math.round(eased * target)))
        rafId = t < 1 ? requestAnimationFrame(tick) : null
      }
      rafId = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [targets, durationMs])

  return { ref, values }
}
