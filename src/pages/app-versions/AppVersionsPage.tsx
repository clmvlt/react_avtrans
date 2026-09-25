import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { useAdminAppVersionsQuery } from '@/features/app-versions/api/useAdminAppVersionsQuery'
import { useDeleteAppVersionMutation } from '@/features/app-versions/api/useDeleteAppVersionMutation'
import { AppVersionCreateDialog } from '@/features/app-versions/components/AppVersionCreateDialog'
import { AppVersionEditDialog } from '@/features/app-versions/components/AppVersionEditDialog'
import { AppVersionsSkeleton } from '@/features/app-versions/components/AppVersionsSkeleton'
import { AppVersionsTable } from '@/features/app-versions/components/AppVersionsTable'
import { AppVersionsToolbar } from '@/features/app-versions/components/AppVersionsToolbar'
import { filterAppVersions } from '@/features/app-versions/lib/appVersionList'
import { useDialogState } from '@/hooks/useDialogState'
import type { AppVersionDTO } from '@/models'

/**
 * /app-versions (admin) : versions de l'APK Android. Garde admin comme le Vue ; seul le lien du
 * menu est limité à un e-mail (Q-APPVERSIONS : parité).
 */
export default function AppVersionsPage() {
  const versionsQuery = useAdminAppVersionsQuery()
  const deleteVersion = useDeleteAppVersionMutation()
  const [search, setSearch] = useState('')
  const dialogs = useDialogState<'create' | 'edit' | 'delete', AppVersionDTO>()

  const handleDelete = () => {
    const version = dialogs.item
    if (!version) return
    deleteVersion.mutate(version.id, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Version supprimée avec succès' })
        dialogs.close()
      },
      onError: (err) => {
        toast.error('Erreur', {
          description: err instanceof Error ? err.message : 'Erreur lors de la suppression',
        })
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[1400px]">
          {versionsQuery.isPending ? (
            <AppVersionsSkeleton />
          ) : versionsQuery.isError ? (
            <ErrorState
              error={versionsQuery.error}
              onRetry={() => void versionsQuery.refetch()}
              isRetrying={versionsQuery.isRefetching}
            />
          ) : (
            <div className="space-y-4">
              <AppVersionsToolbar
                search={search}
                onSearchChange={setSearch}
                onCreate={() => dialogs.open('create')}
              />
              <AppVersionsTable
                versions={filterAppVersions(versionsQuery.data, search)}
                onEdit={(version) => dialogs.open('edit', version)}
                onDelete={(version) => dialogs.open('delete', version)}
              />
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        title="Supprimer la version"
        description="Cette action est irréversible."
        icon={null}
        isPending={deleteVersion.isPending}
        onConfirm={handleDelete}
      >
        <p className="text-sm text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer cette version ?
        </p>
      </ConfirmDialog>

      <AppVersionCreateDialog open={dialogs.isOpen('create')} onOpenChange={dialogs.onOpenChange} />

      <AppVersionEditDialog
        open={dialogs.isOpen('edit')}
        onOpenChange={dialogs.onOpenChange}
        versionId={dialogs.type === 'edit' ? (dialogs.item?.id ?? null) : null}
      />
    </div>
  )
}
