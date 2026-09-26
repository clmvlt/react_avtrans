import { History, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ServiceDTO } from '@/models'
import { hasLocationData, isLocationInvalid } from '../lib/serviceLocation'

/** Actions sur un pointage de la liste. */
export type ServiceRowHandlers = {
  onLocation: (service: ServiceDTO) => void
  onHistory: (serviceUuid: string | undefined) => void
  onEdit: (service: ServiceDTO) => void
  onDelete: (service: ServiceDTO) => void
}

type ServiceRowActionsProps = {
  service: ServiceDTO
  handlers: ServiceRowHandlers
}

/**
 * Localisation (rouge si une position vaut 0,0), historique, modifier, supprimer : icônes à partir
 * de `md`, menu « ⋮ » en dessous.
 */
export function ServiceRowActions({ service, handlers }: ServiceRowActionsProps) {
  const showLocation = hasLocationData(service)
  const invalidLocation = isLocationInvalid(service)

  return (
    <>
      <div className="hidden shrink-0 gap-1 md:flex">
        {showLocation && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handlers.onLocation(service)}
            title="Localisation"
            className={invalidLocation ? 'text-destructive hover:text-destructive' : ''}
          >
            <MapPin className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handlers.onHistory(service.uuid)}
          title="Historique"
        >
          <History className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handlers.onEdit(service)}
          title="Modifier"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:text-destructive"
          onClick={() => handlers.onDelete(service)}
          title="Supprimer"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Actions">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {showLocation && (
            <DropdownMenuItem
              onSelect={() => handlers.onLocation(service)}
              className={invalidLocation ? 'text-destructive focus:text-destructive' : ''}
            >
              <MapPin className="mr-2 size-4" />
              Localisation
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => handlers.onHistory(service.uuid)}>
            <History className="mr-2 size-4" />
            Historique
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handlers.onEdit(service)}>
            <Pencil className="mr-2 size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => handlers.onDelete(service)}
          >
            <Trash2 className="mr-2 size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
