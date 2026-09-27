import { Badge } from '@/components/ui/badge'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

type VehiculeEntretiensTabsProps = {
  /** Nombre de configurations (actives et inactives, comme le Vue). */
  configCount: number
  /** Onglet « Configurations ». */
  canManage: boolean
}

/** Onglets « Entretiens » / « Configurations » de /entretiens/vehicule/:id, à placer dans `Tabs`. */
export function VehiculeEntretiensTabs({ configCount, canManage }: VehiculeEntretiensTabsProps) {
  return (
    <div className="border-b">
      <TabsList variant="line" className="w-max">
        <TabsTrigger value="entretiens" className="flex-none px-3">
          Entretiens
        </TabsTrigger>
        {canManage && (
          <TabsTrigger value="configurations" className="flex-none px-3">
            Configurations
            {configCount > 0 && <Badge variant="secondary">{configCount}</Badge>}
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  )
}
