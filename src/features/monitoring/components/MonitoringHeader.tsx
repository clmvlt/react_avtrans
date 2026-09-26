import { PresenceStatsPills } from './PresenceStatsPills'

type MonitoringHeaderProps = {
  present: number
  onBreak: number
  absent: number
}

/**
 * En-tête collant du suivi des présences : titre et compteurs. Repris tel quel du Vue
 * (`sticky top-0 z-30`), il passe donc sous la navbar collante au défilement.
 */
export function MonitoringHeader({ present, onBreak, absent }: MonitoringHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-foreground md:text-xl">Suivi des présences</h1>
          <PresenceStatsPills present={present} onBreak={onBreak} absent={absent} />
        </div>
      </div>
    </header>
  )
}
