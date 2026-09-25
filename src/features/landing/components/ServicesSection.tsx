import { Truck } from 'lucide-react'
import { heavyService, services } from '../data/services'
import { HeavyServiceCard } from './HeavyServiceCard'
import { SectionHeading } from './SectionHeading'
import { ServiceCard } from './ServiceCard'

export function ServicesSection() {
  return (
    <section
      id="services"
      className="scroll-mt-20 bg-background py-24 sm:py-32"
      aria-labelledby="services-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Truck}
          badge="Nos services"
          title="Coursier, messagerie et transport en Bretagne"
          titleId="services-title"
          className="mb-16 sm:mb-20"
        >
          Du simple pli au chargement complet en poids lourd, de la course urgente au transport
          frigorifique. Votre coursier et transporteur à Saint-Brieuc, Lamballe et dans tout le
          Grand Ouest.
        </SectionHeading>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <HeavyServiceCard service={heavyService} />
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
