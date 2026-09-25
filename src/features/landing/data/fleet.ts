import {
  ArrowUpFromLine,
  Boxes,
  Container,
  Package,
  Snowflake,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import masterImg from '@/assets/images/master.webp'
import porteurImg from '@/assets/images/porteur.webp'
import type { ServicePoint } from './services'

export type VehicleItem = {
  image: string
  /** Dimensions intrinsèques de l'image (évite le décalage de mise en page au chargement). */
  width: number
  height: number
  alt: string
  /** Dimensions indicatives affichées dans la fiche technique. */
  lengthM: number
  heightM: number
  volume: string
  badge: string
  badgeIcon: LucideIcon
  title: string
  description: string
  specs: ServicePoint[]
}

export const fleet: VehicleItem[] = [
  {
    image: masterImg,
    width: 1200,
    height: 676,
    alt: 'Fourgon AVTRANS Concept pour coursier et messagerie express en Bretagne',
    lengthM: 6.3,
    heightM: 3.15,
    volume: '20 m³',
    badge: 'Véhicule léger',
    badgeIcon: Truck,
    title: 'Fourgons & utilitaires',
    description:
      'Coursier express, colis et palettes : la solution réactive pour vos livraisons urgentes à Saint-Brieuc, Lamballe et dans tout le Grand Ouest.',
    specs: [
      { icon: Package, label: 'De 1 m³ à 20 m³ de capacité' },
      { icon: Snowflake, label: 'Version frigorifique disponible' },
    ],
  },
  {
    image: porteurImg,
    width: 1200,
    height: 900,
    alt: 'Porteur poids lourd AVTRANS Concept pour transport de palettes et fret en Bretagne',
    lengthM: 9.8,
    heightM: 3.7,
    volume: '60 m³',
    badge: 'Poids lourd',
    badgeIcon: Container,
    title: 'Porteur poids lourd',
    description:
      "Palettes, lots volumineux et chargements complets : le fret en poids lourd depuis les Côtes-d'Armor vers la Bretagne et la France entière.",
    specs: [
      { icon: Boxes, label: "Jusqu'à 60 m³ de capacité" },
      { icon: ArrowUpFromLine, label: 'Hayon élévateur, livraison sans quai' },
    ],
  },
]
