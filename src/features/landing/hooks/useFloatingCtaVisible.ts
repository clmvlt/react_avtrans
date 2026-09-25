import { useEffect, useState } from 'react'

/**
 * Visibilité du bouton d'appel flottant : après le héro (défilement > hauteur de la fenêtre) et
 * tant que la section contact n'occupe pas la moitié basse de l'écran. Même calcul que
 * Landing.vue, recalculé à chaque défilement (sans effet si la section est introuvable).
 */
export function useFloatingCtaVisible(sectionId = 'contact') {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById(sectionId)
      if (!section) return
      const sectionTop = section.getBoundingClientRect().top
      setVisible(window.scrollY > window.innerHeight && sectionTop > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionId])

  return visible
}
