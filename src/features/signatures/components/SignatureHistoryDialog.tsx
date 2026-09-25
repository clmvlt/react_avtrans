import { FilePenLine, LoaderCircle } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserDTO } from '@/models'
import { useUserSignaturesQuery } from '../api/useUserSignaturesQuery'
import { formatSignatureBase64, formatSignatureDateTime } from '../lib/signatureFormatters'

type SignatureHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Utilisateur dont on affiche l'historique (conservé pendant l'animation de fermeture). */
  user: UserDTO | null | undefined
}

/**
 * Historique des signatures d'un utilisateur, chargé à l'ouverture. La clé de requête par
 * utilisateur évite qu'une réponse lente d'un autre historique ne s'affiche (bug du Vue).
 */
export function SignatureHistoryDialog({ open, onOpenChange, user }: SignatureHistoryDialogProps) {
  const query = useUserSignaturesQuery(user?.uuid, { enabled: open })
  const signatures = query.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Historique - {user?.firstName || ''} {user?.lastName || ''}
          </DialogTitle>
          <DialogDescription>Liste des signatures de l'utilisateur</DialogDescription>
        </DialogHeader>

        {query.isPending ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <LoaderCircle className="size-6 animate-spin text-primary" />
            <p className="m-0 text-sm text-muted-foreground">Chargement de l'historique...</p>
          </div>
        ) : query.isError ? (
          <ErrorState
            message={query.error.message || "Erreur lors du chargement de l'historique"}
            onRetry={() => void query.refetch()}
            isRetrying={query.isRefetching}
          />
        ) : signatures.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <FilePenLine className="size-8 opacity-50" />
            <p className="m-0">Aucune signature trouvée pour cet utilisateur</p>
          </div>
        ) : (
          <div className="flex max-h-[400px] flex-col gap-4 overflow-y-auto">
            {signatures.map((signature, index) => (
              <div key={signature.uuid ?? index} className="rounded-md border bg-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatSignatureDateTime(signature.date)}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {signature.heuresSignees}h
                  </span>
                </div>
                <div className="text-center">
                  {signature.signatureBase64 && (
                    <img
                      src={formatSignatureBase64(signature.signatureBase64)}
                      alt="Signature"
                      className="max-h-[120px] max-w-full rounded-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
