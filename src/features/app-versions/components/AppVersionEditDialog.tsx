import { useIsMutating } from '@tanstack/react-query'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { appVersionKeys } from '../api/queryKeys'
import { useAppVersionQuery } from '../api/useAppVersionQuery'
import { AppVersionEditForm } from './AppVersionEditForm'

type AppVersionEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Version à modifier (conservée pendant l'animation de fermeture) */
  versionId: string | null
}

/**
 * Dialog « Modifier la version » : la version est rechargée à chaque ouverture (le contenu du
 * dialog est démonté à la fermeture). Une erreur de chargement affiche « Réessayer » au lieu du
 * formulaire vide et enregistrable du Vue (erreur de chargement, MIGRATION.md 8.1).
 */
export function AppVersionEditDialog({ open, onOpenChange, versionId }: AppVersionEditDialogProps) {
  // Fermeture (overlay, Échap, croix) bloquée pendant l'enregistrement
  const saving = useIsMutating({ mutationKey: appVersionKeys.update() }) > 0

  const handleOpenChange = (next: boolean) => {
    if (!next && saving) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la version</DialogTitle>
          <DialogDescription>Modifiez les informations de la version.</DialogDescription>
        </DialogHeader>

        {versionId && (
          <AppVersionEditContent versionId={versionId} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

type AppVersionEditContentProps = {
  versionId: string
  onClose: () => void
}

function AppVersionEditContent({ versionId, onClose }: AppVersionEditContentProps) {
  const versionQuery = useAppVersionQuery(versionId)

  if (versionQuery.isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Chargement...">
        <Skeleton className="h-44 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (versionQuery.isError) {
    return (
      <ErrorState
        error={versionQuery.error}
        onRetry={() => void versionQuery.refetch()}
        isRetrying={versionQuery.isRefetching}
      />
    )
  }

  return <AppVersionEditForm version={versionQuery.data} onClose={onClose} />
}
