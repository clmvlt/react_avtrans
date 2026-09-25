import type { LucideIcon } from 'lucide-react'

type ListEmptyStateProps = {
  icon: LucideIcon
  message: string
}

/** Liste mobile vide : icône estompée et message (même rendu que la ligne vide des tableaux). */
export function ListEmptyState({ icon: Icon, message }: ListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
      <Icon className="size-10 opacity-50" />
      <p>{message}</p>
    </div>
  )
}
