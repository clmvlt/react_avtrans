import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ChangeType } from '../data/changelog'
import { useChangelog } from '../hooks/useChangelog'

const TYPE_LABELS: Record<ChangeType, string> = {
  feature: 'Nouveau',
  fix: 'Correction',
  improvement: 'Amélioration',
}

const BADGE_VARIANTS: Record<ChangeType, 'default' | 'destructive' | 'outline'> = {
  feature: 'default',
  fix: 'destructive',
  improvement: 'outline',
}

const BADGE_CLASSES: Record<ChangeType, string> = {
  feature: '',
  fix: '',
  improvement: 'border-green-500/50 text-green-600 dark:text-green-400',
}

/** Date du changelog (« 26 mars 2026 ») */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type ChangelogDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Nouveautés de la dernière version, filtrées par rôle. Marquées comme vues quelle que soit la
 * façon de fermer (bouton, croix, Échap, overlay : décision Q-GLOBALDIALOGS ; le Vue ne le
 * faisait que pour « Fermer »).
 */
export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
  const { latestEntry: entry, markAsSeen } = useChangelog()

  const handleOpenChange = (next: boolean) => {
    if (!next) markAsSeen()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
        // Sans date (aucune entrée pour ce rôle), pas de description : on le dit à Radix
        {...(!entry?.date && { 'aria-describedby': undefined })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            {/* « Nouveautés v » quand aucune entrée n'est visible pour ce rôle : comme le Vue */}
            Nouveautés v{entry?.version}
          </DialogTitle>
          {entry?.date && <DialogDescription>{formatDate(entry.date)}</DialogDescription>}
        </DialogHeader>

        {entry && entry.changes.length > 0 ? (
          <div className="space-y-3 py-2">
            {entry.changes.map((change, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge
                  variant={BADGE_VARIANTS[change.type]}
                  className={cn('mt-0.5 shrink-0', BADGE_CLASSES[change.type])}
                >
                  {TYPE_LABELS[change.type]}
                </Badge>
                <span className="text-sm text-foreground">{change.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Aucune nouveauté pour le moment.
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
