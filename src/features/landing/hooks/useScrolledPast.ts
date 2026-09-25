import { useEffect, useState } from 'react'

/**
 * Vrai quand la page a défilé de plus de `threshold` px (en-tête opaque de la landing).
 * Comme Landing.vue, la valeur n'est mise à jour qu'au défilement, pas au montage (annexe
 * auth-landing-versions, bug B20 reproduit : une page restaurée déjà défilée garde l'en-tête
 * transparent jusqu'au premier défilement). setState ne re-rend que si le booléen change.
 */
export function useScrolledPast(threshold: number) {
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolledPast
}
