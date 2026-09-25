import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/seo'

/** Directive robots d'index.html (landing), conservée par défaut comme dans le Vue */
const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

type PageMetaProps = {
  /** Titre complet de l'onglet et du résultat de recherche */
  title?: string
  /** Meta description ; par défaut celle de la landing */
  description?: string
  /** Directive robots, ex. 'noindex, follow' ; par défaut celle de la landing */
  robots?: string
  /** Chemin canonique (ex. '/login') ; par défaut la landing ('/') */
  canonicalPath?: string
}

/**
 * Métadonnées SEO d'une page, en balises natives React 19 (remplace usePageMeta du Vue).
 * Mêmes valeurs par défaut que le Vue, qui conservait celles d'index.html (la landing) pour
 * tout champ non renseigné. Une seule instance par écran : chaque page publique rend la sienne,
 * AppLayout rend celle des pages protégées. index.html ne porte plus ces quatre balises
 * (MIGRATION.md, décision D2) ; le pré-rendu les recopie pour la landing.
 */
export function PageMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  robots = DEFAULT_ROBOTS,
  canonicalPath = '/',
}: PageMetaProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
    </>
  )
}
