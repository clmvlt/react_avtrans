import { Globe, Shield, Truck, Zap, type LucideIcon } from 'lucide-react'

export type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

export const aboutFeatures: FeatureItem[] = [
  { icon: Shield, title: 'Fiabilité', description: 'Chauffeurs qualifiés et flotte entretenue' },
  { icon: Zap, title: 'Réactivité', description: 'Courses urgentes et livraisons express' },
  { icon: Globe, title: 'Couverture', description: 'Bretagne, Grand Ouest et international' },
  { icon: Truck, title: 'Flotte variée', description: 'Fourgons et porteurs de 1m³ à 60m³' },
]
