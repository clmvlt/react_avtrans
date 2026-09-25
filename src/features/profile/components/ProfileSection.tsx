import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ProfileSectionProps = {
  icon: LucideIcon
  title: string
  /** Bouton de l'en-tête (« Modifier »…), masqué en mode édition */
  action?: ReactNode
  children: ReactNode
}

/** Section de la page /profile : carte avec en-tête (icône, titre, action). */
export function ProfileSection({ icon: Icon, title, action, children }: ProfileSectionProps) {
  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Icon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
