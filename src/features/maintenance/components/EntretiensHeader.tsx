import { EllipsisVertical, Package, Plus, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { BackButton } from '@/components/shared/BackButton'
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
import { FolderTabTrigger } from './FolderTabTrigger'

type EntretiensHeaderProps = {
  /** Boutons « Types d'entretien », « Stock » et « Nouvel entretien ». */
  canManage: boolean
  /** Badge « Prochains » : nombre de véhicules renvoyés par l'API des prochains entretiens. */
  upcomingCount: number
  /** Badge « Tous » : nombre total d'entretiens de la recherche. */
  totalCount: number
  onCreate: () => void
}

/**
 * Header « onglets-dossier » de /entretiens (desktop et mobile), à placer dans `Tabs`.
 * Retour : page précédente de l'app s'il y en a une, sinon /vehicules.
 */
export function EntretiensHeader({
  canManage,
  upcomingCount,
  totalCount,
  onCreate,
}: EntretiensHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <div className="relative hidden items-end bg-muted px-4 pt-2 md:flex">
        <div className="absolute top-1/2 left-4 -translate-y-1/2">
          <BackButton fallback="/vehicules" size="icon" className="size-8" title="Retour" />
        </div>
        <TabsList className="mx-auto gap-0.5 bg-transparent p-0">
          <FolderTabTrigger value="prochains">
            Prochains entretiens
            {upcomingCount > 0 && <Badge variant="secondary">{upcomingCount}</Badge>}
          </FolderTabTrigger>
          <FolderTabTrigger value="historique">
            Tous les entretiens
            {totalCount > 0 && <Badge variant="secondary">{totalCount}</Badge>}
          </FolderTabTrigger>
        </TabsList>
        {canManage && (
          <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/types-entretien">
                <Settings className="size-3.5" />
                Types d&apos;entretien
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/stock">
                <Package className="size-3.5" />
                Stock
              </Link>
            </Button>
            <Button type="button" size="sm" onClick={onCreate}>
              <Plus className="size-3.5" />
              Nouvel entretien
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-muted p-3 md:hidden">
        <div className="flex items-center justify-between">
          <BackButton fallback="/vehicules" size="icon" className="size-8" title="Retour" />
          <TabsList className="gap-0.5 bg-transparent p-0">
            <FolderTabTrigger variant="mobile" value="prochains">
              Prochains
              {upcomingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {upcomingCount}
                </Badge>
              )}
            </FolderTabTrigger>
            <FolderTabTrigger variant="mobile" value="historique">
              Tous
              {totalCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {totalCount}
                </Badge>
              )}
            </FolderTabTrigger>
          </TabsList>
          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions">
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => void navigate('/types-entretien')}>
                  <Settings className="mr-2 size-4" />
                  Types d&apos;entretien
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void navigate('/stock')}>
                  <Package className="mr-2 size-4" />
                  Stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onCreate}>
                  <Plus className="mr-2 size-4" />
                  Nouvel entretien
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </div>
    </>
  )
}
