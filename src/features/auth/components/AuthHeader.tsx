import type { ReactNode } from 'react'
import logoUrl from '@/assets/favicon.png'

type AuthHeaderProps = {
  title: string
  description?: ReactNode
}

/** En-tête des pages d'auth : logo rond, titre et sous-titre facultatif. */
export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex size-16 items-center justify-center overflow-hidden rounded-full sm:size-20">
        <img src={logoUrl} alt="Logo" className="size-full rounded-full object-cover" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
