import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  icon: LucideIcon
  /** Texte de la pastille au-dessus du titre */
  badge: string
  title: string
  /** id du h2, référencé par l'aria-labelledby de la section */
  titleId: string
  /** Marges propres à chaque section (mb-16 sm:mb-20…) */
  className?: string
  /** Paragraphe d'introduction */
  children: ReactNode
}

/** En-tête centré d'une section de la landing : pastille + h2 + introduction, révélé au défilement. */
export function SectionHeading({
  icon: Icon,
  badge,
  title,
  titleId,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn('reveal mx-auto max-w-2xl text-center', className)}>
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
        <Icon className="size-4" />
        {badge}
      </span>
      <h2
        id={titleId}
        className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      <p className="text-lg text-muted-foreground">{children}</p>
    </div>
  )
}
