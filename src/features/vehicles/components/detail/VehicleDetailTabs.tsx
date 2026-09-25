import { useState } from 'react'
import {
  ClipboardList,
  FolderOpen,
  Gauge,
  MessageSquare,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/usePermissions'
import { useDetailTab, type VehicleDetailTab } from '../../hooks/useDetailTab'
import { useVehicleFilesUpload } from '../../hooks/useVehicleFilesUpload'
import type { KmView } from '../../lib/kmView'
import { VehicleCommentsTab } from '../tabs/comments/VehicleCommentsTab'
import { VehicleEquipementsTab } from '../tabs/equipements/VehicleEquipementsTab'
import { VehicleFilesTab } from '../tabs/files/VehicleFilesTab'
import { VehicleKmTab } from '../tabs/kilometrages/VehicleKmTab'
import { VehicleRapportsTab } from '../tabs/rapports/VehicleRapportsTab'

const TABS: { value: VehicleDetailTab; label: string; icon: LucideIcon }[] = [
  { value: 'fichiers', label: 'Fichiers', icon: FolderOpen },
  { value: 'kilometrages', label: 'Historique km', icon: Gauge },
  { value: 'adjustInfos', label: 'Commentaires', icon: MessageSquare },
  { value: 'rapports', label: 'Rapports', icon: ClipboardList },
  { value: 'equipements', label: 'Équipements', icon: Wrench },
]

/** Onglets « classeur » du Vue : fond muted, onglet actif sur fond de page, bordé de violet en sombre. */
const TRIGGER_CLASS =
  'gap-2 rounded-t-lg rounded-b-none border border-transparent px-5 py-2.5 text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none data-[state=inactive]:bg-transparent dark:data-[state=active]:border-primary/40 dark:data-[state=active]:border-b-transparent dark:data-[state=active]:bg-primary/10'

const CONTENT_CLASS = 'mt-0 bg-background p-6'

type VehicleDetailTabsProps = {
  vehiculeId: string
  kmView: KmView
  onKmViewChange: (view: KmView) => void
}

/**
 * Onglets du détail véhicule, « Fichiers » par défaut. Chaque onglet est monté à son activation.
 * Restent ici, pour survivre aux changements d'onglet comme dans le Vue : l'envoi de fichiers,
 * la page de l'historique km (tenue par la page) et la page des commentaires. Les rapports et les
 * équipements repartent de zéro à chaque ouverture de leur onglet.
 */
export function VehicleDetailTabs({ vehiculeId, kmView, onKmViewChange }: VehicleDetailTabsProps) {
  const { isAdmin, isMechanic } = usePermissions()
  // Toujours vrai derrière la garde « mécanicien » (`isMecanicien` du Vue)
  const canManage = isAdmin || isMechanic
  const [activeTab, setActiveTab] = useDetailTab()
  const upload = useVehicleFilesUpload(vehiculeId)
  const [commentsPage, setCommentsPage] = useState(0)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-end bg-muted px-4 pt-2">
          <TabsList className="gap-0.5 bg-transparent p-0">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className={TRIGGER_CLASS} aria-label={label}>
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="fichiers" className={CONTENT_CLASS}>
          <VehicleFilesTab vehiculeId={vehiculeId} canManage={canManage} upload={upload} />
        </TabsContent>

        <TabsContent value="kilometrages" className={CONTENT_CLASS}>
          <VehicleKmTab
            vehiculeId={vehiculeId}
            view={kmView}
            onViewChange={onKmViewChange}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="adjustInfos" className={CONTENT_CLASS}>
          <VehicleCommentsTab
            vehiculeId={vehiculeId}
            page={commentsPage}
            onPageChange={setCommentsPage}
          />
        </TabsContent>

        <TabsContent value="rapports" className={CONTENT_CLASS}>
          <VehicleRapportsTab vehiculeId={vehiculeId} />
        </TabsContent>

        <TabsContent value="equipements" className={CONTENT_CLASS}>
          <VehicleEquipementsTab vehiculeId={vehiculeId} canManage={canManage} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
