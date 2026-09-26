type PresenceStatsPillsProps = {
  present: number
  onBreak: number
  absent: number
}

/** Compteurs de l'en-tête : présents, en pause, absents (libellés masqués sous `sm`). */
export function PresenceStatsPills({ present, onBreak, absent }: PresenceStatsPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
        <span className="size-2 rounded-full bg-green-500" />
        <span>{present}</span>
        <span className="hidden sm:inline">présents</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400">
        <span className="size-2 rounded-full bg-amber-500" />
        <span>{onBreak}</span>
        <span className="hidden sm:inline">en pause</span>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground" />
        <span>{absent}</span>
        <span className="hidden sm:inline">absents</span>
      </div>
    </div>
  )
}
