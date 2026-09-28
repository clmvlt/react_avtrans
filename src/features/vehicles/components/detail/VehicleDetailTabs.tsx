import { useState } from 'react'
import {
  ClipboardList,
  FolderOpen,
  Gauge,
  MessageSquare,
  Repeat,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/usePermissions'
import { useDetailTab, type VehicleDetailTab } from '../../hooks/useDetailTab'
import type { RelaiActions } from '../../hooks/useRelaiDialogs'
import { useVehicleFilesUpload } from '../../hooks/useVehicleFilesUpload'
import type { KmView } from '../../lib/kmView'
import { VehicleCommentsTab } from '../tabs/comments/VehicleCommentsTab'
import { VehicleEquipementsTab } from '../tabs/equipements/VehicleEquipementsTab'
import { VehicleFilesTab } from '../tabs/files/VehicleFilesTab'
import { VehicleKmTab } from '../tabs/kilometrages/VehicleKmTab'
import { VehicleRapportsTab } from '../tabs/rapports/VehicleRapportsTab'
import { VehicleRelaisTab } from '../tabs/relais/VehicleRelaisTab'

const TABS: { value: VehicleDetailTab; label: string; icon: LucideIcon }[] = [
  { value: 'fichiers', label: 'Fichiers', icon: FolderOpen },
  { value: 'kilometrages', label: 'Historique km', icon: Gauge },
  { value: 'relais', label: 'Relais', icon: Repeat },
  { value: 'adjustInfos', label: 'Commentaires', icon: MessageSquare },
  { value: 'rapports', label: 'Rapports', icon: ClipboardList },
  { value: 'equipements', label: 'Équipements', icon: Wrench },
]

const CONTENT_CLASS = 'p-4 sm:p-6'

type VehicleDetailTabsProps = {
  vehiculeId: string
  kmView: KmView
  onKmViewChange: (view: KmView) => void
  /** Dialogs des relais, tenus par la page (D9). */
  relaiActions: RelaiActions
}

/**
 * Onglets du détail véhicule, dans une carte, « Fichiers » par défaut. Les libellés restent
 * visibles sur téléphone : la barre défile horizontalement. Chaque onglet est monté à son
 * activation. Restent ici, pour survivre aux changements d'onglet comme dans le Vue : l'envoi de
 * fichiers, la page de l'historique km (tenue par la page) et la page des commentaires. Les
 * rapports et les équipements repartent de zéro à chaque ouverture de leur onglet.
 */
export function VehicleDetailTabs({
  vehiculeId,
  kmView,
  onKmViewChange,
  relaiActions,
}: VehicleDetailTabsProps) {
  const { isAdmin, isMechanic } = usePermissions()
  // Toujours vrai derrière la garde « mécanicien » (`isMecanicien` du Vue)
  const canManage = isAdmin || isMechanic
  const [activeTab, setActiveTab] = useDetailTab()
  const upload = useVehicleFilesUpload(vehiculeId)
  const [commentsPage, setCommentsPage] = useState(0)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
      <div className="min-w-0 rounded-xl border bg-card">
        {/* py-1 : le trait de l'onglet actif dépasse sous la liste ; sans marge basse, la zone qui
            défile horizontalement afficherait aussi une barre de défilement verticale */}
        <div className="overflow-x-auto border-b px-2 py-1 sm:px-4">
          <TabsList variant="line" className="w-max">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="flex-none px-3">
                <Icon className="size-4" />
                {label}
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

        <TabsContent value="relais" className={CONTENT_CLASS}>
          <VehicleRelaisTab vehiculeId={vehiculeId} canManage={canManage} actions={relaiActions} />
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
