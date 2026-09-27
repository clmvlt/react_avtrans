import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAbsenceTypesQuery } from '@/features/absences/api/useAbsenceTypesQuery'
import { useDeleteAbsenceTypeMutation } from '@/features/absences/api/useDeleteAbsenceTypeMutation'
import { AbsenceTypeFormDialog } from '@/features/absences/components/types/AbsenceTypeFormDialog'
import { AbsenceTypeMobileList } from '@/features/absences/components/types/AbsenceTypeMobileList'
import { AbsenceTypesTable } from '@/features/absences/components/types/AbsenceTypesTable'
import { ABSENCE_TABS } from '@/features/absences/lib/absenceTabs'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useDialogState } from '@/hooks/useDialogState'
import type { AbsenceTypeDTO } from '@/models'

/** Types d'absence (admin) : liste, création, modification, suppression (port d'`AbsenceTypes.vue`). */
export default function AbsenceTypesPage() {
  const typesQuery = useAbsenceTypesQuery()
  const deleteType = useDeleteAbsenceTypeMutation()
  const dialogs = useDialogState<'form' | 'delete', AbsenceTypeDTO>()
  const types = typesQuery.data ?? []
  const selectedType = dialogs.item

  const handleDelete = () => {
    if (!selectedType?.uuid) return
    deleteType.mutate(selectedType.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: "Type d'absence supprimé avec succès" })
        dialogs.close()
      },
      onError: (err) =>
        toast.error('Erreur', { description: errorMessage(err, 'Erreur lors de la suppression') }),
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Absences"
        description="Les types d'absence proposés aux employés, avec leur couleur."
        actions={
          <Button size="sm" onClick={() => dialogs.open('form')}>
            <Plus className="size-4" />
            Nouveau type
          </Button>
        }
      >
        <PageTabs tabs={ABSENCE_TABS} />
      </PageHeader>

      <div>
        {typesQuery.isPending ? (
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">Chargement des types d&apos;absence...</span>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : typesQuery.isError ? (
          <ErrorState
            message={errorMessage(
              typesQuery.error,
              "Erreur lors du chargement des types d'absence",
            )}
            onRetry={() => void typesQuery.refetch()}
            isRetrying={typesQuery.isRefetching}
          />
        ) : (
          <div className="space-y-4">
            <AbsenceTypeMobileList
              types={types}
              onEdit={(type) => dialogs.open('form', type)}
              onDelete={(type) => dialogs.open('delete', type)}
            />
            <AbsenceTypesTable
              types={types}
              onEdit={(type) => dialogs.open('form', type)}
              onDelete={(type) => dialogs.open('delete', type)}
            />
          </div>
        )}
      </div>

      <AbsenceTypeFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        absenceType={dialogs.type === 'form' ? selectedType : null}
      />

      <ConfirmDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        title="Supprimer le type"
        description="Confirmer la suppression du type d'absence"
        hideDescription
        isPending={deleteType.isPending}
        onConfirm={handleDelete}
      >
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer ce type d&apos;absence ?
          </p>
          <p className="text-center text-sm font-semibold text-destructive">
            Cette action est irréversible.
          </p>
          {selectedType && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted p-4">
              <span
                className="size-6 shrink-0 rounded border border-border"
                style={{ backgroundColor: selectedType.color }}
              />
              <span className="font-medium text-foreground">{selectedType.name}</span>
            </div>
          )}
        </div>
      </ConfirmDialog>
    </PageContainer>
  )
}
