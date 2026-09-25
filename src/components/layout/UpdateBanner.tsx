import { LoaderCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useVersionCheck } from '@/hooks/useVersionCheck'
import { cn } from '@/lib/utils'

/**
 * Bandeau « nouvelle version disponible » (production uniquement), en haut de toutes les pages.
 * Toujours rendu pour reproduire la transition du Vue : glisse depuis le haut à l'apparition
 * (300 ms) et y remonte quand on clique sur « Plus tard » (200 ms) ; masqué, il est invisible
 * et hors de l'écran.
 */
export function UpdateBanner() {
  const { newVersionAvailable, newVersion, performUpdate, dismissUpdate } = useVersionCheck()
  // Jamais remis à false : la page se recharge
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = () => {
    setIsUpdating(true)
    void performUpdate()
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-primary px-4 py-3 text-primary-foreground shadow-md transition-[translate,visibility]',
        newVersionAvailable
          ? 'translate-y-0 duration-300 ease-out'
          : 'invisible -translate-y-full duration-200 ease-in',
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <RefreshCw className="size-5 animate-spin" />
          <span className="text-sm font-medium">
            Une nouvelle version <strong>(v{newVersion})</strong> est disponible.
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={dismissUpdate}>
            Plus tard
          </Button>
          <Button
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            disabled={isUpdating}
            onClick={handleUpdate}
          >
            {isUpdating && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            Mettre à jour
          </Button>
        </div>
      </div>
    </div>
  )
}
