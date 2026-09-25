import { Link } from 'react-router'
import { LegalLayout } from '@/components/layout/LegalLayout'
import { PageMeta } from '@/components/shared/PageMeta'

export default function MentionsLegalesPage() {
  return (
    <>
      {/* SEO : page légale non prioritaire, pour éviter qu'elle capte le référencement */}
      <PageMeta title="Mentions légales — AVTRANS Concept" robots="noindex, follow" />

      <LegalLayout title="Mentions légales" lastUpdated="24 juin 2026">
        <h2>1. Éditeur du site</h2>
        <p>Le présent site est édité par :</p>
        <address>
          <strong>AVTRANS CONCEPT</strong>
          <br />
          Entreprise unipersonnelle à responsabilité limitée (EURL) au capital de 3 000 €
          <br />
          Siège social : ZA de Pommeret, Route de Quenhoet, 22120 Hillion (Côtes-d'Armor)
          <br />
          SIREN : 845 350 347 — SIRET (siège) : 845 350 347 00025
          <br />
          RCS Saint-Brieuc : 845 350 347
          <br />
          N° TVA intracommunautaire : FR 21 845 350 347
          <br />
          Code APE : 49.41A (Transports routiers de fret interurbains)
          <br />
          Téléphone : <a href="tel:+33257770777">02 57 77 07 77</a>
          <br />
          Email : <a href="mailto:contact@avtrans-concept.com">contact@avtrans-concept.com</a>
        </address>

        <h2>2. Directeur de la publication</h2>
        <p>
          Le directeur de la publication est M. Anthony Veillet, gérant de la société AVTRANS
          CONCEPT.
        </p>

        <h2>3. Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <address>
          <strong>OVH SAS</strong>
          <br />
          Société par actions simplifiée au capital de 10 174 560 €
          <br />
          RCS Lille Métropole 424 761 419 00045
          <br />
          Siège social : 2 rue Kellermann, 59100 Roubaix — France
          <br />
          Site :{' '}
          <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">
            www.ovhcloud.com
          </a>
        </address>

        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble des éléments composant ce site (textes, images, logos, marques, charte
          graphique, structure et code) est la propriété exclusive d'AVTRANS Concept ou de ses
          partenaires, et est protégé par les lois françaises et internationales relatives à la
          propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou
          partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
          sans autorisation écrite préalable d'AVTRANS Concept.
        </p>

        <h2>5. Données personnelles</h2>
        <p>
          Le traitement des données personnelles collectées sur ce site est décrit dans notre{' '}
          <Link to="/politique-confidentialite">Politique de confidentialité</Link>. Conformément au
          Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et
          Libertés », vous disposez de droits d'accès, de rectification et de suppression de vos
          données.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Ce site utilise des cookies strictement nécessaires à son fonctionnement (notamment la
          gestion de la session de connexion à l'espace employé). Aucun cookie de mesure d'audience
          ou de publicité n'est déposé sans votre consentement. Pour plus de détails, consultez la{' '}
          <Link to="/politique-confidentialite">Politique de confidentialité</Link>.
        </p>

        <h2>7. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers (notamment l'espace client et le site
          vitrine). AVTRANS Concept n'exerce aucun contrôle sur ces sites et décline toute
          responsabilité quant à leur contenu ou à l'usage qui pourrait en être fait.
        </p>

        <h2>8. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. En cas de litige et à
          défaut de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </LegalLayout>
    </>
  )
}
