import { Gauge } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useVehiclesQuery } from '@/features/vehicles/api/useVehiclesQuery'
import type { KilometrageInput } from '../schemas/kilometrage'
import { KilometrageForm } from './KilometrageForm'

type KilometrageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Saisie obligatoire avant « Démarrer » : ni croix, ni Échap, ni clic sur l'overlay */
  required: boolean
  defaultVehiculeId: string
  /** Dernier relevé en cours de lecture (admin et mécanicien : lu à l'ouverture) */
  defaultsLoading: boolean
  isSaving: boolean
  /** Erreur de l'API à l'enregistrement */
  errorMessage: string
  onSubmit: (values: KilometrageInput) => void
}

/**
 * Dialog « Saisie du kilométrage ». En mode obligatoire, il ne se ferme qu'après
 * l'enregistrement (exception à la règle de fermeture à l'overlay, reprise du Vue).
 *
 * Bug B-14 reproduit : si les véhicules ne se chargent pas (ou s'il n'y en a aucun), le dialog
 * obligatoire reste impossible à quitter. L'erreur de chargement est en revanche affichée avec
 * « Réessayer » (le Vue l'effaçait aussitôt).
 */
export function KilometrageDialog({
  open,
  onOpenChange,
  required,
  defaultVehiculeId,
  defaultsLoading,
  isSaving,
  errorMessage,
  onSubmit,
}: KilometrageDialogProps) {
  const vehiclesQuery = useVehiclesQuery({ enabled: open })
  const vehicleOptions = (vehiclesQuery.data ?? []).map((vehicle) => ({
    value: vehicle.id || '',
    label: `${vehicle.immat} - ${vehicle.brand} ${vehicle.model}`,
  }))

  const handleOpenChange = (next: boolean) => {
    if (!next && required) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        showCloseButton={!required}
        onEscapeKeyDown={(event) => {
          if (required) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (required) event.preventDefault()
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Gauge className="size-5 text-primary" />
            <DialogTitle>Saisie du kilométrage</DialogTitle>
          </div>
          <DialogDescription>
            {required
              ? 'Avant de commencer votre journée, veuillez renseigner le kilométrage de votre véhicule.'
              : "Renseignez le kilométrage actuel d'un véhicule."}
          </DialogDescription>
        </DialogHeader>

        {vehiclesQuery.isLoadingError && (
          <ErrorState
            message="Erreur lors du chargement des véhicules"
            onRetry={() => void vehiclesQuery.refetch()}
            isRetrying={vehiclesQuery.isFetching}
          />
        )}

        {errorMessage && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {defaultsLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <KilometrageForm
            vehicleOptions={vehicleOptions}
            vehiclesLoading={vehiclesQuery.isLoading}
            defaultVehiculeId={defaultVehiculeId}
            isSaving={isSaving}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
