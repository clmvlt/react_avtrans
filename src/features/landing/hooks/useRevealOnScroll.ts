import { useLayoutEffect, type RefObject } from 'react'

const REVEAL_SELECTOR = '.reveal'
const REVEALED_CLASS = 'revealed'

/**
 * Apparition au défilement : ajoute la classe `revealed` (landing.css) aux éléments `.reveal`
 * du conteneur quand 10 % d'entre eux entre dans l'écran, une seule fois.
 *
 * Contenu pré-rendu (`window.__PRERENDERED__`, posé par scripts/prerender.cjs) : les éléments
 * déjà à l'écran sont révélés tout de suite, pour ne pas disparaître puis réapparaître au montage.
 * Effet de mise en page (avant le premier affichage) car il mesure les éléments.
 *
 * La classe est ajoutée hors de React (classList) : les `className` de ces éléments sont des
 * chaînes constantes, React ne les réécrit donc jamais.
 */
export function useRevealOnScroll(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(REVEALED_CLASS)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    const prerendered = Boolean((window as Window & { __PRERENDERED__?: boolean }).__PRERENDERED__)
    root.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
      if (prerendered && element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add(REVEALED_CLASS)
      } else {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [rootRef])
}
