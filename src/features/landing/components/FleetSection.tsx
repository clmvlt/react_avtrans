import { Truck } from 'lucide-react'
import { fleet } from '../data/fleet'
import { SectionHeading } from './SectionHeading'
import { VehicleCard } from './VehicleCard'

export function FleetSection() {
  return (
    <section
      id="fleet"
      className="scroll-mt-20 bg-background py-24 sm:py-32"
      aria-labelledby="fleet-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Truck}
          badge="Notre flotte"
          title="Flotte de véhicules pour coursier et fret en Bretagne"
          titleId="fleet-title"
          className="mb-16"
        >
          Du fourgon au porteur poids lourd, de 1m³ à 60m³ : des véhicules équipés pour la
          messagerie express, le fret en poids lourd et le transport sous température dirigée dans
          tout le Grand Ouest.
        </SectionHeading>

        {/* Cartes véhicules : fourgon + porteur poids lourd */}
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {fleet.map((vehicle, index) => (
            <VehicleCard key={vehicle.title} vehicle={vehicle} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
