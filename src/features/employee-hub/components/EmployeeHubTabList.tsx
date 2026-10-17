import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { HubTab, HubTabConfig } from '../lib/hubTabs'

type EmployeeHubTabListProps = {
  tabs: HubTabConfig[]
  /** Demandes en attente par onglet (pastille ambre) */
  counts: Partial<Record<HubTab, number>>
}

/** Onglets de la fiche, soulignés, qui défilent horizontalement sur téléphone. */
export function EmployeeHubTabList({ tabs, counts }: EmployeeHubTabListProps) {
  return (
    <div className="-mx-4 [scrollbar-width:none] overflow-x-auto border-b px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <TabsList variant="line" className="h-11 w-max gap-1 p-0">
        {tabs.map(({ value, label, icon: Icon }) => {
          const count = counts[value] ?? 0
          return (
            <TabsTrigger key={value} value={value} className="flex-none px-3">
              <Icon />
              {label}
              {count > 0 && (
                <span
                  className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-[11px] leading-5 font-semibold text-warning-foreground tabular-nums"
                  aria-label={`${count} en attente`}
                >
                  {count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </div>
  )
}
