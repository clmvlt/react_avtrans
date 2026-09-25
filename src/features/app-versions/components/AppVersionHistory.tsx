import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { AppVersionDTO } from '@/models'
import { AppVersionHistoryItem } from './AppVersionHistoryItem'

type AppVersionHistoryProps = {
  versions: AppVersionDTO[]
}

/** « Versions précédentes (n) » de /download, repliées par défaut. */
export function AppVersionHistory({ versions }: AppVersionHistoryProps) {
  const [open, setOpen] = useState(false)
  // Notes dépliées, par version ; conservées quand on replie puis rouvre l'historique (comme le Vue)
  const [expandedNotes, setExpandedNotes] = useState<ReadonlySet<string>>(() => new Set())
  const Chevron = open ? ChevronUp : ChevronDown

  const setNotesOpen = (versionId: string, notesOpen: boolean) => {
    setExpandedNotes((current) => {
      const next = new Set(current)
      if (notesOpen) next.add(versionId)
      else next.delete(versionId)
      return next
    })
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4 border-t pt-4">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Versions précédentes ({versions.length})</span>
          <Chevron className="size-4" />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-2.5">
        {versions.map((version) => (
          <AppVersionHistoryItem
            key={version.id}
            version={version}
            notesOpen={expandedNotes.has(version.id)}
            onNotesOpenChange={(notesOpen) => setNotesOpen(version.id, notesOpen)}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
