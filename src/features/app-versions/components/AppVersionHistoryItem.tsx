import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { AppVersionDTO } from '@/models'
import { appVersionsService } from '@/services'
import { formatDownloadCount, formatFileSize, formatLongDate } from '../lib/format'

type AppVersionHistoryItemProps = {
  version: AppVersionDTO
  notesOpen: boolean
  onNotesOpenChange: (open: boolean) => void
}

/** Version précédente de /download : informations, notes dépliables, téléchargement. */
export function AppVersionHistoryItem({
  version,
  notesOpen,
  onNotesOpenChange,
}: AppVersionHistoryItemProps) {
  const NotesChevron = notesOpen ? ChevronUp : ChevronDown

  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{version.versionName}</span>
          <span className="text-[11px] text-muted-foreground">Build {version.versionCode}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatFileSize(version.fileSize)}</span>
          <span className="text-border">&middot;</span>
          <span>{formatLongDate(version.createdAt)}</span>
          <span className="text-border">&middot;</span>
          <span className="flex items-center gap-1">
            <Download className="size-3" />
            {formatDownloadCount(version.downloadCount)}
          </span>
        </div>
      </div>

      {version.changelog && (
        <Collapsible open={notesOpen} onOpenChange={onNotesOpenChange} className="mb-2">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <NotesChevron className="size-3" />
              Notes de version
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="mt-2 rounded-md bg-background p-2.5 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
              {version.changelog}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <a href={appVersionsService.getDownloadUrl(version.id)} download>
          <Download className="size-3.5" />
          Télécharger
        </a>
      </Button>
    </div>
  )
}
