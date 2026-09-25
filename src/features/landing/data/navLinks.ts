/** Identifiants des sections de la landing, cibles des ancres (#services…) */
export type SectionId = 'services' | 'about' | 'fleet' | 'faq' | 'contact'

export type NavLink = {
  id: SectionId
  label: string
}

/** Navigation de l'en-tête (desktop et menu mobile) : vrais liens d'ancre, défilement doux en JS */
export const navLinks: NavLink[] = [
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'À propos' },
  { id: 'fleet', label: 'Notre flotte' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]
