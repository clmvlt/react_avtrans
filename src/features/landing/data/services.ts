import {
  ArrowUpFromLine,
  Boxes,
  Locate,
  Package,
  Snowflake,
  Warehouse,
  Weight,
  type LucideIcon,
} from 'lucide-react'

/** Micro-interaction de l'icône au survol de la carte (keyframes dans landing.css) */
export type IconAnimation = 'anim-bounce' | 'anim-spin' | 'anim-ping' | 'anim-lift'

export type ServiceItem = {
  icon: LucideIcon
  title: string
  description: string
  animation: IconAnimation
}

export type ServicePoint = {
  icon: LucideIcon
  label: string
}

export type HeavyService = {
  badge: string
  title: string
  description: string
  points: ServicePoint[]
}

export const services: ServiceItem[] = [
  {
    icon: Package,
    title: 'Fret & Messagerie',
    description:
      'Du simple pli à la palette de 1000 kg. Livraisons locales, nationales et internationales.',
    animation: 'anim-bounce',
  },
  {
    icon: Snowflake,
    title: 'Température Dirigée',
    description:
      'Chaîne du froid irréprochable pour vos produits pharmaceutiques et marchandises sensibles.',
    animation: 'anim-spin',
  },
  {
    icon: Locate,
    title: 'Suivi en Temps Réel',
    description:
      'Géolocalisation de chaque envoi et traçabilité complète à chaque étape du transport.',
    animation: 'anim-ping',
  },
  {
    icon: Warehouse,
    title: 'Stockage & Affrètement',
    description: 'Entrepôt sécurisé pour vos solutions de stockage ponctuelles ou récurrentes.',
    animation: 'anim-lift',
  },
]

/** Service mis en avant : occupe deux colonnes de la grille services. */
export const heavyService: HeavyService = {
  badge: 'Poids lourd',
  title: 'Livraison en poids lourd',
  description:
    'Palettes, lots volumineux ou chargement complet : notre porteur prend le relais des fourgons pour vos flux les plus importants, en Bretagne, dans le Grand Ouest et vers la France entière.',
  points: [
    { icon: Boxes, label: 'Palettes, lots volumineux et chargements complets' },
    { icon: Weight, label: "Porteur poids lourd jusqu'à 60 m³" },
    { icon: ArrowUpFromLine, label: 'Hayon élévateur pour livrer sans quai' },
  ],
}
