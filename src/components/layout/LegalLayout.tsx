import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import logoImg from '@/assets/logo.png'

/**
 * Typographie du contenu légal (ex-`.legal-content :deep(...)` de LegalLayout.vue).
 * Tailles en valeurs arbitraires là où le Vue ne fixait que la taille (l'interligne reste hérité).
 */
const LEGAL_CONTENT_CLASS = [
  '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[1.25rem] [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-foreground',
  '[&_h2:first-child]:mt-0',
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground',
  '[&_p]:mb-4 [&_p]:leading-[1.7] [&_p]:text-muted-foreground',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground',
  '[&_li]:mb-2 [&_li]:leading-[1.7]',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_address]:mb-4 [&_address]:leading-[1.7] [&_address]:text-muted-foreground [&_address]:not-italic',
].join(' ')

const FOOTER_LINK_CLASS = 'text-muted-foreground transition-colors hover:text-foreground'

type LegalLayoutProps = {
  title: string
  subtitle?: string
  /** Date affichée après « Dernière mise à jour : » */
  lastUpdated?: string
  children: ReactNode
}

/** Mise en page des pages légales : en-tête avec retour à l'accueil, bandeau de titre, contenu, pied de page. */
export function LegalLayout({ title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* En-tête */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo AVTRANS Concept"
              width={36}
              height={36}
              className="size-9 rounded-xl shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight">AVTRANS</span>
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Solutions Transport
              </span>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      {/* Titre */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
          {lastUpdated && (
            <p className="mt-4 text-sm text-muted-foreground">
              Dernière mise à jour : {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className={LEGAL_CONTENT_CLASS}>{children}</div>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AVTRANS Concept
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link to="/" className={FOOTER_LINK_CLASS}>
              Accueil
            </Link>
            <Link to="/mentions-legales" className={FOOTER_LINK_CLASS}>
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className={FOOTER_LINK_CLASS}>
              Politique de confidentialité
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
