import { useId } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useParentServicesQuery } from '../api/useParentServicesQuery'
import { formatParentServiceLabel } from '../lib/serviceForm'

/** Valeur du choix « Automatique » (un `SelectItem` Radix ne peut pas valoir une chaîne vide). */
const AUTO = 'auto'

type ParentServiceFieldProps = {
  userUuid: string
  /** Date de début de la pause (`YYYY-MM-DD`) : services de ce jour et de la veille */
  date: string
  /** UUID du service choisi ; vide = automatique */
  value: string
  onChange: (value: string) => void
  /** Service actuel de la pause modifiée (proposé même s'il sort de la plage de dates) */
  currentParentUuid: string
}

/**
 * Service d'une pause (D12), facultatif : « Automatique » laisse l'API prendre le service en cours
 * au début de la pause ; sinon un service de travail de l'employé, ce jour-là ou la veille.
 */
export function ParentServiceField({
  userUuid,
  date,
  value,
  onChange,
  currentParentUuid,
}: ParentServiceFieldProps) {
  const id = useId()
  const query = useParentServicesQuery(userUuid, date, true)
  const services = query.data ?? []
  const showCurrent =
    !!currentParentUuid && !services.some((service) => service.uuid === currentParentUuid)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Service</Label>
      <Select value={value || AUTO} onValueChange={(next) => onChange(next === AUTO ? '' : next)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO}>Automatique (service en cours au début de la pause)</SelectItem>
          {showCurrent && <SelectItem value={currentParentUuid}>Service actuel</SelectItem>}
          {services.map((service) =>
            service.uuid ? (
              <SelectItem key={service.uuid} value={service.uuid}>
                {formatParentServiceLabel(service)}
              </SelectItem>
            ) : null,
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {query.isError
          ? 'Impossible de charger les services : la pause sera rattachée automatiquement.'
          : 'La pause doit commencer pendant ce service.'}
      </p>
    </div>
  )
}
