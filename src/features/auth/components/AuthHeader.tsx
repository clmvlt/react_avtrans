import type { ReactNode } from 'react'
import logoUrl from '@/assets/favicon.png'

type AuthHeaderProps = {
  title: string
  description?: ReactNode
}

/** En-tête des pages d'auth : logo carré arrondi, titre et sous-titre facultatif. */
export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <img src={logoUrl} alt="AVTRANS" className="mb-5 size-14 rounded-xl shadow-xs" />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-balance text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
