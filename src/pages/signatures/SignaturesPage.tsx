import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Input } from '@/components/ui/input'
import {
  getSignaturesLoadErrorMessage,
  useAllUsersSignaturesQuery,
} from '@/features/signatures/api/useAllUsersSignaturesQuery'
import { DeleteSignatureDialog } from '@/features/signatures/components/DeleteSignatureDialog'
import { SignatureHistoryDialog } from '@/features/signatures/components/SignatureHistoryDialog'
import { SignaturesSkeleton } from '@/features/signatures/components/SignaturesSkeleton'
import { SignaturesTable } from '@/features/signatures/components/SignaturesTable'
import { SignatureViewDialog } from '@/features/signatures/components/SignatureViewDialog'
import {
  filterSignatureEntries,
  type SignatureUserEntry,
} from '@/features/signatures/lib/signatureResponses'
import { useDialogState } from '@/hooks/useDialogState'

/** /signatures (admin) : dernière signature de chaque utilisateur, historique, suppression. */
export default function SignaturesPage() {
  const query = useAllUsersSignaturesQuery()
  const [search, setSearch] = useState('')
  const dialogs = useDialogState<'view' | 'history' | 'delete', SignatureUserEntry>()

  const entries = query.data ? filterSignatureEntries(query.data, search) : []

  return (
    <PageContainer>
      <PageHeader
        title="Signatures"
        description="Suivez la signature des relevés d'heures mensuels par les employés."
      />

      {query.data ? (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom ou email..."
              aria-label="Rechercher par nom ou email"
              className="pl-9"
            />
          </div>

          <SignaturesTable
            entries={entries}
            onView={(entry) => dialogs.open('view', entry)}
            onHistory={(entry) => dialogs.open('history', entry)}
            onDelete={(entry) => dialogs.open('delete', entry)}
          />
        </div>
      ) : query.isError ? (
        <ErrorState
          message={getSignaturesLoadErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isRefetching}
        />
      ) : (
        <SignaturesSkeleton />
      )}

      <SignatureViewDialog
        open={dialogs.isOpen('view')}
        onOpenChange={dialogs.onOpenChange}
        entry={dialogs.item}
      />
      <SignatureHistoryDialog
        open={dialogs.isOpen('history')}
        onOpenChange={dialogs.onOpenChange}
        user={dialogs.item?.user}
      />
      <DeleteSignatureDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        entry={dialogs.item}
      />
    </PageContainer>
  )
}
