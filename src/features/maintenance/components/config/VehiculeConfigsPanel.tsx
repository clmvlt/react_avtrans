import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TypeEntretienDTO, VehiculeTypeEntretienDTO } from '@/models'
import { useDeleteVehiculeConfigMutation } from '../../api/useVehiculeConfigMutations'
import type { useVehiculeConfigsQuery } from '../../api/useVehiculeConfigsQuery'
import { notifyError, notifySuccess } from '../../lib/notify'
import { EmptyBlock } from '../EmptyBlock'
import { IrreversibleNotice } from '../IrreversibleNotice'
import { ConfigEntretienDialog } from './ConfigEntretienDialog'
import { VehiculeConfigCard } from './VehiculeConfigCard'

type VehiculeConfigsPanelProps = {
  vehiculeId: string
  configsQuery: ReturnType<typeof useVehiculeConfigsQuery>
  types: TypeEntretienDTO[]
}

type FormState = { open: boolean; key: number; config: VehiculeTypeEntretienDTO | null }

/**
 * Onglet « Configurations » d'EntretiensVehicule.vue : périodicités d'entretien du véhicule,
 * ajout (désactivé quand tous les types sont déjà configurés), modification et suppression.
 */
export function VehiculeConfigsPanel({
  vehiculeId,
  configsQuery,
  types,
}: VehiculeConfigsPanelProps) {
  const [form, setForm] = useState<FormState>({ open: false, key: 0, config: null })
  const [configToDelete, setConfigToDelete] = useState<string | null>(null)
  const deleteConfig = useDeleteVehiculeConfigMutation()

  const configs = configsQuery.data ?? []
  const configuredTypeIds = configs.map((c) => c.typeEntretien?.id)
  const availableTypes = types.filter((t) => !configuredTypeIds.includes(t.id))

  const openForm = (config: VehiculeTypeEntretienDTO | null) =>
    setForm((current) => ({ open: true, key: current.key + 1, config }))

  const handleConfirmDelete = () => {
    if (!configToDelete) return
    deleteConfig.mutate(
      { id: configToDelete, vehiculeId },
      {
        onSuccess: () => {
          notifySuccess('Configuration supprimée avec succès')
          setConfigToDelete(null)
        },
        onError: () => notifyError('Erreur lors de la suppression de la configuration'),
      },
    )
  }

  const renderContent = () => {
    if (configsQuery.isPending) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-lg border bg-card p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-end gap-1">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (configsQuery.isError) {
      return (
        <ErrorState
          error={configsQuery.error}
          onRetry={() => void configsQuery.refetch()}
          isRetrying={configsQuery.isFetching}
        />
      )
    }
    if (configs.length === 0) {
      return (
        <EmptyBlock icon={Settings}>
          <p className="text-lg text-muted-foreground">
            Aucune configuration d&apos;entretien définie
          </p>
        </EmptyBlock>
      )
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configs.map((config, index) => (
          <VehiculeConfigCard
            key={config.id ?? index}
            config={config}
            onEdit={openForm}
            onDelete={(c) => c.id && setConfigToDelete(c.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Configurations d&apos;entretien</h2>
        <Button
          type="button"
          size="sm"
          disabled={availableTypes.length === 0}
          onClick={() => openForm(null)}
        >
          <Plus className="size-3.5" />
          Ajouter
        </Button>
      </div>

      {renderContent()}

      <ConfigEntretienDialog
        open={form.open}
        onOpenChange={(open) => {
          if (!open) setForm((current) => ({ ...current, open: false }))
        }}
        formKey={form.key}
        vehiculeId={vehiculeId}
        availableTypes={availableTypes}
        config={form.config}
      />

      <ConfirmDialog
        open={configToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfigToDelete(null)
        }}
        title="Supprimer la configuration"
        description="Cette action est irréversible."
        icon={null}
        isPending={deleteConfig.isPending}
        onConfirm={handleConfirmDelete}
      >
        <IrreversibleNotice
          variant="centered"
          message="Êtes-vous sûr de vouloir supprimer cette configuration d'entretien ?"
        />
      </ConfirmDialog>
    </>
  )
}
