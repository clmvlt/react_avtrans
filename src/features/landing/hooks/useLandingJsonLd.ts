import { useEffect } from 'react'
import { faq } from '../data/faq'
import { buildLandingJsonLd } from '../lib/buildLandingJsonLd'

/** Attribut qui identifie le script JSON-LD de la landing dans <head> */
const JSONLD_ATTRIBUTE = 'data-landing-jsonld'

/**
 * Injecte le JSON-LD WebPage + FAQPage de la landing dans <head> et le retire en quittant la
 * page. Jamais en <script> dans l'arbre React : le pré-rendu refuse tout <script> dans #app.
 * Un exemplaire déjà présent (recopié dans <head> par le pré-rendu, ou laissé par un double
 * montage) est remplacé pour ne jamais le dupliquer.
 */
export function useLandingJsonLd() {
  useEffect(() => {
    document.head.querySelectorAll(`script[${JSONLD_ATTRIBUTE}]`).forEach((el) => el.remove())

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(JSONLD_ATTRIBUTE, '')
    script.textContent = JSON.stringify(buildLandingJsonLd(faq))
    document.head.appendChild(script)

    return () => script.remove()
  }, [])
}
