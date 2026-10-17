import { FilePenLine } from 'lucide-react'
import { useUserSignaturesQuery } from '@/features/signatures/api/useUserSignaturesQuery'
import {
  formatSignatureBase64,
  formatSignatureDateTime,
} from '@/features/signatures/lib/signatureFormatters'
import { ListState } from './ListState'

type SignaturesTabProps = {
  userUuid: string
}

/**
 * Signatures mensuelles de l'employé (GET /signatures/user/{uuid}) : date, heures signées et
 * image de la signature, sur fond blanc pour rester lisible en thème sombre.
 */
export function SignaturesTab({ userUuid }: SignaturesTabProps) {
  const query = useUserSignaturesQuery(userUuid)
  const signatures = query.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <ListState
        isPending={query.isPending}
        error={query.error}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
        isEmpty={signatures.length === 0}
        emptyIcon={FilePenLine}
        emptyTitle="Aucune signature"
        emptyDescription="L'employé n'a encore signé aucun relevé d'heures."
        loadingLabel="Chargement des signatures..."
      >
        <p className="text-sm text-muted-foreground">
          {signatures.length} signature{signatures.length > 1 ? 's' : ''}
        </p>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-4">
          {signatures.map((signature, index) => (
            <li
              key={signature.uuid ?? index}
              className="flex flex-col gap-3 rounded-xl border bg-card p-3"
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {formatSignatureDateTime(signature.date)}
                </span>
                <span className="font-semibold text-success tabular-nums">
                  {signature.heuresSignees ?? 0} h
                </span>
              </div>
              {signature.signatureBase64 ? (
                // Fond blanc voulu dans les deux thèmes : la signature est tracée à l'encre noire
                <div className="flex h-28 items-center justify-center rounded-lg border bg-white p-2">
                  <img
                    src={formatSignatureBase64(signature.signatureBase64)}
                    alt={`Signature du ${formatSignatureDateTime(signature.date)}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                  Image indisponible
                </div>
              )}
            </li>
          ))}
        </ul>
      </ListState>
    </div>
  )
}
