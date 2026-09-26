import { ArrowLeft, EllipsisVertical, Gauge, Plus, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TabsList } from '@/components/ui/tabs'
import type { VehiculeDTO } from '@/models'
import { FolderTabTrigger } from '../FolderTabTrigger'

type VehiculeEntretiensHeaderProps = {
  vehiculeId: string
  vehicule: VehiculeDTO | null | undefined
  /** Nombre de configurations (actives et inactives, comme le Vue). */
  configCount: number
  /** Onglet « Configurations » et bouton « Nouvel entretien ». */
  canManage: boolean
  onCreate: () => void
}

/**
 * Header « onglets-dossier » de /entretiens/vehicule/:id, à placer dans `Tabs` : retour vers
 * /entretiens, marque, modèle et kilométrage du véhicule, onglets, actions.
 */
export function VehiculeEntretiensHeader({
  vehiculeId,
  vehicule,
  configCount,
  canManage,
  onCreate,
}: VehiculeEntretiensHeaderProps) {
  const navigate = useNavigate()
  const vehicleName = `${vehicule?.brand ?? ''} ${vehicule?.model ?? ''}`
  const km = `${vehicule?.latestKm?.toLocaleString('fr-FR') || 0} km`

  const backButton = (
    <Button variant="ghost" size="icon-sm" title="Retour" aria-label="Retour" asChild>
      <Link to="/entretiens">
        <ArrowLeft className="size-4" />
      </Link>
    </Button>
  )

  return (
    <>
      <div className="relative hidden items-end bg-muted px-4 pt-2 md:flex">
        <div className="absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-3">
          {backButton}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{vehicleName}</span>
            <Badge variant="default" className="gap-1">
              <Gauge className="size-3" />
              {km}
            </Badge>
          </div>
        </div>
        <TabsList className="mx-auto gap-0.5 bg-transparent p-0">
          <FolderTabTrigger value="entretiens">Entretiens</FolderTabTrigger>
          {canManage && (
            <FolderTabTrigger value="configurations">
              Configurations
              {configCount > 0 && <Badge variant="secondary">{configCount}</Badge>}
            </FolderTabTrigger>
          )}
        </TabsList>
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/vehicules/${vehiculeId}`}>
              <Truck className="size-3.5" />
              Voir le véhicule
            </Link>
          </Button>
          {canManage && (
            <Button type="button" size="sm" onClick={onCreate}>
              <Plus className="size-3.5" />
              Nouvel entretien
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-muted p-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {backButton}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{vehicleName}</span>
              <Badge variant="default" className="mt-0.5 w-fit gap-1 text-xs">
                <Gauge className="size-3" />
                {km}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => void navigate(`/vehicules/${vehiculeId}`)}>
                <Truck className="mr-2 size-4" />
                Voir le véhicule
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onCreate}>
                    <Plus className="mr-2 size-4" />
                    Nouvel entretien
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsList className="mx-auto gap-0.5 bg-transparent p-0">
          <FolderTabTrigger variant="mobile" value="entretiens">
            Entretiens
          </FolderTabTrigger>
          {canManage && (
            <FolderTabTrigger variant="mobile" value="configurations">
              Config
              {configCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {configCount}
                </Badge>
              )}
            </FolderTabTrigger>
          )}
        </TabsList>
      </div>
    </>
  )
}
