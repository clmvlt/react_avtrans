import { Mail, MapPin, Phone, Smartphone } from 'lucide-react'
import {
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  EMAIL_HREF,
  PHONE_MAIN,
  PHONE_MOBILE,
} from '../data/contact'
import { ContactCard } from './ContactCard'

const CONTACT_LINK_CLASS = 'text-sm text-muted-foreground transition-colors hover:text-primary'

export function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-border bg-muted/50 py-24 sm:py-32"
      aria-labelledby="contact-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            id="contact-title"
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Besoin d'un coursier ou d'un transport en Bretagne ?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Contactez AVTRANS Concept pour un devis gratuit. Notre équipe de coursiers vous
            accompagne à Saint-Brieuc, Lamballe et dans toute la Bretagne.
          </p>

          {/* Cartes de contact */}
          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            <ContactCard icon={Phone} title="Téléphone">
              <a href={PHONE_MAIN.href} className={CONTACT_LINK_CLASS}>
                {PHONE_MAIN.label}
              </a>
            </ContactCard>
            <ContactCard icon={Smartphone} title="Mobile">
              <a href={PHONE_MOBILE.href} className={CONTACT_LINK_CLASS}>
                {PHONE_MOBILE.label}
              </a>
            </ContactCard>
            <ContactCard icon={MapPin} title="Adresse">
              <address className="text-sm text-muted-foreground not-italic">
                {ADDRESS_LOCALITY}
                <br />
                {ADDRESS_REGION}
              </address>
            </ContactCard>
          </div>

          {/* Actions : liens stylés en bouton (le Vue imbriquait un <button> dans le lien,
              MIGRATION.md 8.1) */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={PHONE_MAIN.href}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              <Phone className="size-5" />
              Appeler maintenant
            </a>
            <a
              href={EMAIL_HREF}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-accent"
            >
              <Mail className="size-5" />
              Envoyer un email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
