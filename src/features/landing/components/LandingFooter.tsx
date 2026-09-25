import { Mail, MapPin, Phone, Smartphone } from 'lucide-react'
import { Link } from 'react-router'
import logoImg from '@/assets/logo.png'
import {
  ADDRESS_LOCALITY,
  EMAIL,
  EMAIL_HREF,
  LEGAL_COMPANY,
  LEGAL_HEAD_OFFICE,
  PHONE_MAIN,
  PHONE_MOBILE,
} from '../data/contact'
import { footerServices, legalLinks, quickLinks, serviceAreas } from '../data/footer'

const FOOTER_TITLE_CLASS = 'mb-4 text-sm font-semibold text-foreground'
const FOOTER_LINK_CLASS = 'text-sm text-muted-foreground transition-colors hover:text-foreground'
const FOOTER_CONTACT_LINK_CLASS =
  'flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Marque */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={logoImg}
                alt="Logo AVTRANS Concept"
                width={40}
                height={40}
                loading="lazy"
                className="size-10 rounded-xl"
              />
              <div>
                <span className="text-lg font-bold text-foreground">AVTRANS</span>
                <p className="text-xs text-muted-foreground">Coursier & Transport</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Coursier et transporteur spécialisé : messagerie express, fret et température dirigée.
              Votre partenaire logistique à Saint-Brieuc, Lamballe et dans toute la Bretagne.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className={FOOTER_TITLE_CLASS}>Services</h3>
            <ul className="space-y-2.5">
              {footerServices.map((service) => (
                <li key={service}>
                  <span className="text-sm text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Zones desservies (SEO local) */}
          <div>
            <h3 className={FOOTER_TITLE_CLASS}>Zones desservies</h3>
            <ul className="space-y-2.5">
              {serviceAreas.map((area) => (
                <li key={area} className="text-sm text-muted-foreground">
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Accès rapide */}
          <div>
            <h3 className={FOOTER_TITLE_CLASS}>Accès rapide</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link to={link.to} rel={link.rel} className={FOOTER_LINK_CLASS}>
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener"
                      className={FOOTER_LINK_CLASS}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={FOOTER_TITLE_CLASS}>Contact</h3>
            <address className="not-italic">
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {ADDRESS_LOCALITY}
                </li>
                <li>
                  <a href={PHONE_MAIN.href} className={FOOTER_CONTACT_LINK_CLASS}>
                    <Phone className="size-4 shrink-0" />
                    {PHONE_MAIN.label}
                  </a>
                </li>
                <li>
                  <a href={PHONE_MOBILE.href} className={FOOTER_CONTACT_LINK_CLASS}>
                    <Smartphone className="size-4 shrink-0" />
                    {PHONE_MOBILE.label}
                  </a>
                </li>
                <li>
                  <a href={EMAIL_HREF} className={FOOTER_CONTACT_LINK_CLASS}>
                    <Mail className="size-4 shrink-0" />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bas de page */}
        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AVTRANS Concept — {LEGAL_COMPANY}
            </p>
            <p className="text-xs text-muted-foreground">{LEGAL_HEAD_OFFICE}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
