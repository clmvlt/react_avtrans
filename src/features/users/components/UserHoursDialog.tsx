import { Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserDTO } from '@/models'
import { UserHoursContent } from './hours/UserHoursContent'

type UserHoursDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Employé concerné (UserDTO, UserWithStatusDTO…) */
  user: Pick<UserDTO, 'uuid' | 'firstName' | 'lastName'> | null
}

/**
 * Heures travaillées d'un employé par période (UserHoursModal.vue), contrôlé par `open` et `user`
 * (plus de `ref.open()`). Utilisé par la page Utilisateurs et le suivi des présences. Le contenu
 * est remonté à chaque ouverture : on repart toujours de « Toutes » et d'aujourd'hui.
 */
export function UserHoursDialog({ open, onOpenChange, user }: UserHoursDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
              <Clock className="size-7" />
            </div>
            <div>
              <DialogTitle>Heures travaillées</DialogTitle>
              <DialogDescription>
                {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {user?.uuid && <UserHoursContent key={user.uuid} userUuid={user.uuid} />}
      </DialogContent>
    </Dialog>
  )
}
