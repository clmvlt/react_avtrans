import { User } from 'lucide-react'

type UserServicesHeaderProps = {
  /** « Prénom Nom » ; rien n'est affiché tant que l'employé n'est pas chargé */
  name: string
}

/** Nom de l'employé en tête de ses pointages. */
export function UserServicesHeader({ name }: UserServicesHeaderProps) {
  if (!name) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="size-5" />
      </div>
      <h1 className="text-xl font-bold text-foreground">{name}</h1>
    </div>
  )
}
