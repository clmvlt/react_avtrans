export type FaqItem = {
  question: string
  answer: string
}

/** FAQ : contenu texte indexable (requêtes longue traîne) + données structurées FAQPage. */
export const faq: FaqItem[] = [
  {
    question: 'Quelles zones desservez-vous ?',
    answer:
      "AVTRANS Concept est basé à Pommeret (Hillion), entre Saint-Brieuc et Lamballe. Nos coursiers interviennent chaque jour dans les Côtes-d'Armor (Saint-Brieuc, Lamballe, Dinan, Guingamp, Lannion, Loudéac), sur les quatre départements bretons, vers Rennes et le Grand Ouest, ainsi qu'en national et à l'international.",
  },
  {
    question: 'Quels types de marchandises transportez-vous ?',
    answer:
      "Du simple pli au chargement complet : colis, palettes jusqu'à 1 000 kg, lots volumineux et fret en poids lourd. Nous transportons aussi des produits pharmaceutiques et des marchandises sensibles sous température dirigée, avec une chaîne du froid maîtrisée.",
  },
  {
    question: 'Proposez-vous un service de coursier urgent ?',
    answer:
      'Oui. La course urgente et la livraison express sont au cœur de notre activité : un fourgon part rapidement depuis Saint-Brieuc ou Lamballe, et chaque envoi est suivi en temps réel par géolocalisation, avec une traçabilité complète à chaque étape.',
  },
  {
    question: 'Quels véhicules composent votre flotte ?',
    answer:
      "Des fourgons et utilitaires de 1 m³ à 20 m³, dont une version frigorifique, et un porteur poids lourd de 60 m³ équipé d'un hayon élévateur pour livrer les palettes sans quai de déchargement.",
  },
  {
    question: 'Comment obtenir un devis ?',
    answer:
      "Le devis est gratuit et sans engagement. Appelez-nous au 02 57 77 07 77 (ou au 06 66 58 13 21), ou écrivez à contact@avtrans-concept.com en précisant la nature de l'envoi, les adresses de départ et d'arrivée et le délai souhaité.",
  },
]
