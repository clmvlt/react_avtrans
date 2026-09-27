import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

export type PageTab = {
  to: string
  label: string
  icon?: LucideIcon
}

type PageTabsProps = {
  tabs: PageTab[]
  className?: string
}

/**
 * Onglets entre pages sœurs (une liste et sa configuration : Absences / Types d'absence…).
 * Ce sont des liens : chaque onglet garde son URL. Apparence des `Tabs` de shadcn.
 */
export function PageTabs({ tabs, className }: PageTabsProps) {
  return (
    <nav
      className={cn(
        'inline-flex h-9 w-fit max-w-full items-center overflow-x-auto rounded-lg bg-muted p-[3px] text-muted-foreground',
        className,
      )}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            cn(
              'inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive && 'bg-background text-foreground shadow-sm dark:bg-input/40',
            )
          }
        >
          {tab.icon && <tab.icon className="size-4" />}
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
