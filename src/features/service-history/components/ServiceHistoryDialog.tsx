import { CircleAlert, History, ListChecks, LoaderCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useServiceModificationsQuery } from '../api/useServiceModificationsQuery'
import { useServiceHistory } from '../hooks/useServiceHistory'
import { ModificationTimelineEntry } from './ModificationTimelineEntry'
import { ModificationUser } from './ModificationUser'

/**
 * Modale globale (montée par GlobalDialogs, admins uniquement) : frise des actions admin sur un
 * pointage. Ouverte via useServiceHistory().open(uuid).
 */
export function ServiceHistoryDialog() {
  const { isOpen, serviceUuid, close } = useServiceHistory()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const query = useServiceModificationsQuery(serviceUuid, { enabled: isOpen })

  const modifications = query.data ?? []
  const loading = query.isFetching
  const error = query.isError
    ? query.error.message || "Erreur lors du chargement de l'historique"
    : ''

  // L'employé est le même pour toutes les entrées
  const employee = modifications[0]?.user ?? null
  const isDeleted = modifications[0]?.action === 'DELETE'
  const employeeServicesPath = employee?.uuid ? `/users/${employee.uuid}/services` : ''
  const isOnEmployeePage = pathname === employeeServicesPath

  const goToEmployeeServices = () => {
    if (!employeeServicesPath) return
    close()
    navigate(employeeServicesPath)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <History className="size-5 text-primary" />
            Historique du pointage
            {isDeleted && (
              <Badge variant="outline" className="border-destructive/50 text-destructive">
                Supprimé
              </Badge>
            )}
            {loading && modifications.length > 0 && (
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            )}
          </DialogTitle>
          <DialogDescription>
            Actions des administrateurs sur ce pointage, de la plus récente à la plus ancienne.
          </DialogDescription>
        </DialogHeader>

        {/* Employé concerné */}
        {employee && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            <ModificationUser user={employee} size="md" />
            {employeeServicesPath && !isOnEmployeePage && (
              <Button variant="ghost" size="sm" onClick={goToEmployeeServices}>
                <ListChecks className="size-4" />
                Voir ses pointages
              </Button>
            )}
          </div>
        )}

        {loading && modifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <LoaderCircle className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CircleAlert className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
              Réessayer
            </Button>
          </div>
        ) : modifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <History className="size-10 text-muted-foreground opacity-50" />
            <p className="font-medium text-foreground">Aucune modification enregistrée</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Les modifications antérieures à la mise en place du journal ne sont pas historisées.
            </p>
          </div>
        ) : (
          <ol className="relative ml-3 border-l border-border pl-6">
            {modifications.map((modification) => (
              <ModificationTimelineEntry key={modification.uuid} modification={modification} />
            ))}
          </ol>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
