import { User } from 'lucide-react'
import type { UserDTO } from '@/models'
import { formatUserName } from '../lib/formatters'

type UserChipProps = {
  user: UserDTO
}

/** Auteur d'un commentaire ou d'un rapport : photo ronde de 24 px (ou icône) et nom. */
export function UserChip({ user }: UserChipProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-6 shrink-0 overflow-hidden rounded-full">
        {user.pictureUrl ? (
          <img src={user.pictureUrl} alt={user.firstName} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary text-white">
            <User className="size-3" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-foreground">{formatUserName(user)}</span>
    </div>
  )
}
