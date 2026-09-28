import type { ReactNode } from 'react'
import { CheckCircle2, LoaderCircle, Plus, Repeat, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { VehiculeDTO, VehiculeRelaiDTO } from '@/models'
import { useUpdateVehicleMutation } from '../../api/useUpdateVehicleMutation'
import { useVehicleRelaisQuery } from '../../api/useVehicleRelaisQuery'
import type { RelaiActions } from '../../hooks/useRelaiDialogs'
import { getErrorMessage } from '../../lib/errors'
import { todayLocalISO } from '@/lib/dates'
import { formatDateShort, formatNumber } from '../../lib/formatters'
import {
  describeRelaiVehicle,
  formatRelaiPeriode,
  getLegacyRelaiImmat,
  getRelaiCurrentKm,
} from '../../lib/relais'
import { toUpdatePayload, vehicleToFormValues } from '../../schemas/vehicle'
import { RelaiActionsMenu } from './RelaiActionsMenu'

type VehicleRelaiCardProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  actions: RelaiActions
}

/**
 * Véhicule relais sur la fiche (D9) : relais en cours mis en avant (plaque, période, kilométrage,
 * « Terminer le relais »), relais prévu, ancienne plaque saisie à la main à compléter, ou simple
 * ligne « Déclarer un relais ».
 */
export function VehicleRelaiCard({ vehicule, vehiculeId, actions }: VehicleRelaiCardProps) {
  const relaisQuery = useVehicleRelaisQuery(vehiculeId)
  const relaiEnCours = vehicule.relaiEnCours ?? null
  const legacyImmat = getLegacyRelaiImmat(vehicule)

  if (relaiEnCours) {
    return <RunningRelai relai={relaiEnCours} vehicule={vehicule} actions={actions} />
  }

  if (legacyImmat) {
    return (
      <LegacyRelai
        immat={legacyImmat}
        vehicule={vehicule}
        vehiculeId={vehiculeId}
        actions={actions}
      />
    )
  }

  // Le plus proche des relais prévus (liste du plus récent au plus ancien)
  const prochain = relaisQuery.data?.filter((relai) => relai.statut === 'A_VENIR').at(-1)

  return (
    <section
      aria-label="Véhicule relais"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-dashed px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <Repeat className="size-4 shrink-0 text-muted-foreground" />
        {prochain ? (
          <span className="min-w-0">
            Relais prévu :{' '}
            <span className="font-semibold tracking-wide uppercase">{prochain.immat}</span>{' '}
            <span className="text-muted-foreground">{formatRelaiPeriode(prochain)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Aucun véhicule relais en cours</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={() => actions.declare()}>
          <Plus className="size-4" />
          Déclarer un relais
        </Button>
        {prochain && <RelaiActionsMenu relai={prochain} actions={actions} />}
      </div>
    </section>
  )
}

type RunningRelaiProps = {
  relai: VehiculeRelaiDTO
  vehicule: VehiculeDTO
  actions: RelaiActions
}

function RunningRelai({ relai, vehicule, actions }: RunningRelaiProps) {
  const currentKm = getRelaiCurrentKm(relai)
  const model = describeRelaiVehicle(relai)

  return (
    <section
      aria-label="Véhicule relais en cours"
      className="rounded-xl border border-primary/30 bg-primary/5 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Repeat className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">Véhicule relais en cours</p>
            <p className="text-lg font-semibold tracking-wide text-foreground uppercase">
              {relai.immat}
              {model && (
                <span className="ml-2 text-sm font-normal tracking-normal text-muted-foreground normal-case">
                  {model}
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatRelaiPeriode(relai)}
              {relai.motif && ` · ${relai.motif}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Date de fin connue : le relais court jusqu'à ce jour inclus, rien à terminer */}
          {!relai.dateFin && (
            <Button type="button" size="sm" onClick={() => actions.end(relai)}>
              <CheckCircle2 className="size-4" />
              Terminer le relais
            </Button>
          )}
          <RelaiActionsMenu relai={relai} actions={actions} hideEnd />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <RelaiFact label="Km actuel">
          {currentKm != null ? `${formatNumber(currentKm)} km` : '-'}
        </RelaiFact>
        <RelaiFact label="Km au départ">
          {relai.kmDebut != null ? `${formatNumber(relai.kmDebut)} km` : '-'}
        </RelaiFact>
        <RelaiFact label="Parcourus">
          {relai.kmParcourus != null ? `${formatNumber(relai.kmParcourus)} km` : '-'}
        </RelaiFact>
        <RelaiFact label="Relevés">{relai.nbReleves}</RelaiFact>
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">
        Les kilométrages saisis sur {vehicule.immat ?? 'ce véhicule'} (pointage, relevés) sont
        enregistrés pour le relais{' '}
        {relai.dateFin === todayLocalISO()
          ? "jusqu'à ce soir : le véhicule reprend ses propres kilométrages demain."
          : relai.dateFin
            ? `jusqu'au ${formatDateShort(relai.dateFin)} inclus.`
            : "jusqu'à la fin du relais."}
      </p>
    </section>
  )
}

function RelaiFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-background/70 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{children}</dd>
    </div>
  )
}

type LegacyRelaiProps = {
  immat: string
  vehicule: VehiculeDTO
  vehiculeId: string
  actions: RelaiActions
}

/** Plaque relais saisie à la main avant le suivi des relais : à compléter ou à retirer. */
function LegacyRelai({ immat, vehicule, vehiculeId, actions }: LegacyRelaiProps) {
  const updateVehicle = useUpdateVehicleMutation(vehiculeId)

  const handleRemove = () => {
    const payload = toUpdatePayload(
      vehicleToFormValues(vehicule),
      { pictureBase64: null, removePicture: false },
      null,
    )
    updateVehicle.mutate(payload, {
      onSuccess: () => toast.success('Plaque relais retirée'),
      onError: (error) =>
        toast.error('Erreur', {
          description: getErrorMessage(error, 'Erreur lors de la sauvegarde'),
        }),
    })
  }

  return (
    <section
      aria-label="Plaque relais"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2 text-sm">
        <Repeat className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="min-w-0">
          Plaque relais notée :{' '}
          <span className="font-semibold tracking-wide uppercase">{immat}</span>
          <span className="block text-xs text-muted-foreground">
            Sans dates ni kilométrage : complétez-la pour suivre le relais, ou retirez-la si le
            véhicule est revenu.
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updateVehicle.isPending}
          onClick={handleRemove}
        >
          {updateVehicle.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          Retirer
        </Button>
        <Button type="button" size="sm" onClick={() => actions.declare(immat)}>
          <Repeat className="size-4" />
          Compléter le relais
        </Button>
      </div>
    </section>
  )
}
