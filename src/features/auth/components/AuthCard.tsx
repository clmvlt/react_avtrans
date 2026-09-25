import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  /** Classes de la carte, fusionnées (ex. `max-w-[520px]` pour l'inscription) */
  className?: string
  children: ReactNode
}

/** Coquille commune des pages d'auth : carte centrée sur fond `muted`, pleine hauteur. */
export function AuthCard({ className, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 sm:p-6">
      <div
        className={cn(
          'w-full max-w-[440px] rounded-lg border border-border bg-card p-6 shadow-lg sm:p-8',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
