import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  JSONLD_BUSINESS_ID,
  JSONLD_WEBSITE_ID,
  SITE_URL,
} from '@/config/seo'
import type { FaqItem } from '../data/faq'

/**
 * Données structurées propres à la landing : WebPage + FAQPage.
 * LocalBusiness (#business) et WebSite (#website) sont déclarés statiquement dans index.html
 * (visibles sans JS) ; on s'y relie par leurs @id. Mêmes clés, dans le même ordre, que Landing.vue.
 */
export function buildLandingJsonLd(faq: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        isPartOf: { '@id': JSONLD_WEBSITE_ID },
        about: { '@id': JSONLD_BUSINESS_ID },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }
}
