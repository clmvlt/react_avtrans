import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  /** Classes de la carte, fusionnées (ex. `max-w-[520px]` pour l'inscription) */
  className?: string
  children: ReactNode
}

/**
 * Coquille commune des pages d'auth publiques : carte centrée sur fond `muted`, pleine hauteur,
 * et lien « Retour au site » sous la carte.
 */
export function AuthCard({ className, children }: AuthCardProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-8 sm:p-6">
      <div
        className={cn(
          'w-full max-w-[440px] rounded-2xl border bg-card p-6 shadow-sm sm:p-8',
          className,
        )}
      >
        {children}
      </div>
      <Link
        to="/"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-3.5" />
        Retour au site
      </Link>
    </main>
  )
}
