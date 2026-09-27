import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ProfileSectionProps = {
  icon: LucideIcon
  title: string
  /** Bouton de l'en-tête (« Modifier »…), masqué en mode édition */
  action?: ReactNode
  children: ReactNode
}

/**
 * Section de la page /profile : carte avec en-tête (icône, titre, action). L'action passe sous
 * le titre si la place manque.
 */
export function ProfileSection({ icon: Icon, title, action, children }: ProfileSectionProps) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
