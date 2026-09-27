type PresenceStatsPillsProps = {
  present: number
  onBreak: number
  absent: number
}

const plural = (count: number) => (count > 1 ? 's' : '')

/** Compteurs sous l'en-tête de la page : présents, en pause, absents. */
export function PresenceStatsPills({ present, onBreak, absent }: PresenceStatsPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
        <span className="size-2 rounded-full bg-green-500" />
        {present} présent{plural(present)}
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400">
        <span className="size-2 rounded-full bg-amber-500" />
        {onBreak} en pause
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground" />
        {absent} absent{plural(absent)}
      </div>
    </div>
  )
}
