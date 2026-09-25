import { CLIENT_SPACE_URL, SHOWCASE_URL } from './contact'

export const footerServices = [
  'Coursier express',
  'Fret & Messagerie',
  'Transport poids lourd',
  'Température dirigée',
  'Suivi temps réel',
  'Stockage & Affrètement',
]

/** Zones desservies (SEO local) */
export const serviceAreas = [
  'Saint-Brieuc',
  'Lamballe',
  'Pommeret',
  'Dinan',
  'Guingamp',
  'Lannion & Loudéac',
  'Rennes & Grand Ouest',
  'National & International',
]

export type QuickLink =
  /** Page de l'application (lien du routeur) */
  | { label: string; to: string; rel?: string }
  /** Site externe, ouvert dans un nouvel onglet */
  | { label: string; href: string }

export const quickLinks: QuickLink[] = [
  { label: 'Connexion', to: '/login' },
  { label: 'Inscription', to: '/register', rel: 'nofollow' },
  { label: 'Application mobile', to: '/download', rel: 'nofollow' },
  { label: 'Site vitrine', href: SHOWCASE_URL },
  { label: 'Espace Client', href: CLIENT_SPACE_URL },
]

/** Liens légaux du bas de page */
export const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique de confidentialité', to: '/politique-confidentialite' },
]
