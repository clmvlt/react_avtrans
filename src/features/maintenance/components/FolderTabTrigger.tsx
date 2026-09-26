import type { ComponentProps } from 'react'
import { TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const TRIGGER_CLASSES = {
  /** Onglet « dossier » du header desktop d'Entretiens / EntretiensVehicule. */
  desktop:
    'gap-2 rounded-t-lg rounded-b-none border border-transparent px-5 py-2.5 text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:bg-transparent dark:data-[state=active]:border-primary/40 dark:data-[state=active]:border-b-transparent dark:data-[state=active]:bg-primary/10',
  /** Onglet compact du header mobile. */
  mobile:
    'gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent dark:data-[state=active]:border-primary/40 dark:data-[state=active]:bg-primary/10',
}

type FolderTabTriggerProps = ComponentProps<typeof TabsTrigger> & {
  variant?: keyof typeof TRIGGER_CLASSES
}

/**
 * Onglet des headers « onglets-dossier » des pages d'entretiens (classes du Vue), à placer dans
 * un `TabsList` transparent (`gap-0.5 bg-transparent p-0`).
 */
export function FolderTabTrigger({
  variant = 'desktop',
  className,
  ...props
}: FolderTabTriggerProps) {
  return <TabsTrigger className={cn(TRIGGER_CLASSES[variant], className)} {...props} />
}
