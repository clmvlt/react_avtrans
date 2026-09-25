import { Link } from 'react-router'
import { LegalLayout } from '@/components/layout/LegalLayout'
import { PageMeta } from '@/components/shared/PageMeta'

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      {/* SEO : page légale non prioritaire, pour éviter qu'elle capte le référencement */}
      <PageMeta title="Politique de confidentialité — AVTRANS Concept" robots="noindex, follow" />

      <LegalLayout
        title="Politique de confidentialité"
        subtitle="Comment AVTRANS Concept collecte, utilise et protège vos données personnelles."
        lastUpdated="24 juin 2026"
      >
        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles est la société{' '}
          <strong>AVTRANS CONCEPT</strong>, EURL au capital de 3 000 € dont le siège social est
          situé ZA de Pommeret, Route de Quenhoet, 22120 Hillion (Côtes-d'Armor), SIREN 845 350 347,
          représentée par son gérant M. Anthony Veillet.
        </p>
        <address>
          Contact : <a href="mailto:contact@avtrans-concept.com">contact@avtrans-concept.com</a>
          <br />
          Téléphone : <a href="tel:+33257770777">02 57 77 07 77</a>
        </address>

        <h2>2. Données collectées</h2>
        <p>Selon votre interaction avec AVTRANS Concept, nous pouvons collecter :</p>
        <ul>
          <li>
            <strong>Données de contact</strong> : nom, adresse email, numéro de téléphone, lorsque
            vous nous contactez pour une demande de devis ou d'information.
          </li>
          <li>
            <strong>Données de compte (espace employé)</strong> : identité, identifiants de
            connexion, adresse email, numéros de téléphone (personnel et professionnel), rôle et
            statut.
          </li>
          <li>
            <strong>Données d'activité professionnelle</strong> : pointages (heures de service,
            pauses, kilométrage), absences, acomptes, signatures et autres données nécessaires à la
            gestion du personnel et de la flotte.
          </li>
          <li>
            <strong>Données techniques</strong> : données strictement nécessaires au fonctionnement
            de l'application (jeton de session de connexion).
          </li>
        </ul>

        <h2>3. Finalités et bases légales</h2>
        <p>Vos données sont traitées pour les finalités suivantes :</p>
        <ul>
          <li>
            Répondre à vos demandes de contact et de devis — <strong>intérêt légitime</strong> de la
            société.
          </li>
          <li>
            Gérer la relation de travail, le pointage des heures, les absences et les acomptes —{' '}
            <strong>exécution du contrat de travail</strong> et <strong>obligations légales</strong>
            .
          </li>
          <li>
            Assurer la gestion et le suivi de la flotte de véhicules —{' '}
            <strong>intérêt légitime</strong>.
          </li>
          <li>
            Garantir la sécurité et le bon fonctionnement de la plateforme —{' '}
            <strong>intérêt légitime</strong>.
          </li>
        </ul>

        <h2>4. Destinataires des données</h2>
        <p>
          Vos données sont destinées aux services habilités d'AVTRANS CONCEPT. Elles peuvent être
          transmises à nos sous-traitants techniques — notamment notre hébergeur OVH SAS (données
          hébergées en France) — dans la stricte limite nécessaire à l'exécution de leurs
          prestations, ainsi qu'aux administrations et organismes lorsque la loi l'impose. Aucune
          donnée n'est vendue à des tiers.
        </p>

        <h2>5. Durée de conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles
          elles ont été collectées, puis archivées ou supprimées conformément aux obligations
          légales :
        </p>
        <ul>
          <li>Données de contact / prospection : jusqu'à 3 ans après le dernier contact.</li>
          <li>
            Données liées à la relation de travail : pendant la durée du contrat puis selon les
            délais légaux de conservation (jusqu'à 5 ans pour les bulletins et documents associés).
          </li>
          <li>Documents comptables et de transport : archivage jusqu'à 7 ans (durée légale).</li>
        </ul>

        <h2>6. Sécurité</h2>
        <p>
          AVTRANS Concept met en œuvre des mesures techniques et organisationnelles appropriées pour
          protéger vos données contre tout accès, altération, divulgation ou destruction non
          autorisés (chiffrement des échanges, contrôle des accès par authentification, gestion des
          rôles).
        </p>

        <h2>7. Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi «
          Informatique et Libertés », vous disposez des droits suivants : droit d'accès, de
          rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.
        </p>
        <p>
          Pour exercer ces droits, contactez-nous à l'adresse{' '}
          <a href="mailto:contact@avtrans-concept.com">contact@avtrans-concept.com</a>. Une preuve
          d'identité pourra vous être demandée.
        </p>
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
          pouvez adresser une réclamation à la CNIL (Commission Nationale de l'Informatique et des
          Libertés) —{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">
            www.cnil.fr
          </a>
          .
        </p>

        <h2>8. Cookies</h2>
        <p>
          Le site et l'application utilisent uniquement des cookies (ou technologies équivalentes)
          strictement nécessaires à leur fonctionnement, notamment pour maintenir votre session de
          connexion à l'espace employé. Ces cookies ne nécessitent pas de consentement préalable.
          Aucun cookie publicitaire ou de traçage tiers n'est déposé.
        </p>

        <h2>9. Contact</h2>
        <p>
          Pour toute question relative à la présente politique ou au traitement de vos données
          personnelles, vous pouvez nous écrire à{' '}
          <a href="mailto:contact@avtrans-concept.com">contact@avtrans-concept.com</a> ou consulter
          nos <Link to="/mentions-legales">mentions légales</Link>.
        </p>
      </LegalLayout>
    </>
  )
}
