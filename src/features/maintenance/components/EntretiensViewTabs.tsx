import { Badge } from '@/components/ui/badge'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

type EntretiensViewTabsProps = {
  /** Compteur « Prochains » : nombre de véhicules renvoyés par l'API des prochains entretiens. */
  upcomingCount: number
  /** Compteur « Tous » : nombre total d'entretiens de la recherche. */
  totalCount: number
}

/**
 * Onglets « Prochains entretiens » / « Tous les entretiens » de /entretiens, avec leurs
 * compteurs, à placer dans `Tabs`. Libellés raccourcis sur téléphone.
 */
export function EntretiensViewTabs({ upcomingCount, totalCount }: EntretiensViewTabsProps) {
  return (
    <div className="border-b">
      <TabsList variant="line" className="w-max">
        <TabsTrigger value="prochains" className="flex-none px-3">
          <span>
            Prochains<span className="max-sm:hidden"> entretiens</span>
          </span>
          {upcomingCount > 0 && <Badge variant="secondary">{upcomingCount}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="historique" className="flex-none px-3">
          <span>
            Tous<span className="max-sm:hidden"> les entretiens</span>
          </span>
          {totalCount > 0 && <Badge variant="secondary">{totalCount}</Badge>}
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
