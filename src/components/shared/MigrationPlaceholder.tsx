import { Construction } from 'lucide-react'

type MigrationPlaceholderProps = {
  title: string
}

/**
 * TEMPORAIRE : page pas encore migrée depuis le Vue. Chaque page de `src/pages/` qui l'utilise
 * est remplacée pendant la phase 4 ; ce composant est supprimé en phase 5.
 */
export function MigrationPlaceholder({ title }: MigrationPlaceholderProps) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
      <Construction className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">Page en cours de migration vers React.</p>
    </main>
  )
}
