import { Shield } from 'lucide-react'
import expertiseImg from '@/assets/images/expertise-image.webp'
import { aboutFeatures } from '../data/about'

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-y border-border bg-muted/50 py-24 sm:py-32"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="reveal relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={expertiseImg}
                alt="Livraison AVTRANS en Bretagne — coursier express Côtes-d'Armor"
                width={1200}
                height={899}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>
            {/* Badge flottant */}
            <div className="absolute -right-2 -bottom-6 rounded-xl border border-border bg-card p-4 shadow-xl sm:-right-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Certifié & Assuré</p>
                  <p className="text-xs text-muted-foreground">Archivage 7 ans</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="reveal">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              À propos
            </span>
            <h2
              id="about-title"
              className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Votre coursier et transporteur en Bretagne
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Implantée à Pommeret dans les Côtes-d'Armor, entre Saint-Brieuc et Lamballe, AVTRANS
              Concept est votre partenaire pour le transport et la messagerie express. Nous
              collaborons étroitement avec vous pour fournir des solutions sur mesure, de la course
              urgente au fret régulier en poids lourd.
            </p>
            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              Coursier quotidien de Saint-Brieuc à Rennes, de Lamballe à Dinan, en passant par
              Guingamp, Lannion et Loudéac. Transport de marchandises sensibles — produits
              pharmaceutiques sous température dirigée — avec suivi en temps réel par
              géolocalisation sur les quatre départements bretons, le Grand Ouest et
              l'international.
            </p>

            {/* Atouts */}
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
