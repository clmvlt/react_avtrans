import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserDTO } from '@/models'
import { InfoTile } from './InfoTile'
import { RoleBadge } from './RoleBadge'

type ProfileInfoViewProps = {
  user: UserDTO | null
}

/** Badge « Oui » (vert) / « Non » (rouge) */
function YesNoBadge({ value }: { value?: boolean }) {
  return (
    <Badge
      variant={value ? 'outline' : 'destructive'}
      className={cn(value && 'border-success/50 text-success')}
    >
      {value ? 'Oui' : 'Non'}
    </Badge>
  )
}

/** Informations personnelles en lecture : photo, identité, rôle et état du compte. */
export function ProfileInfoView({ user }: ProfileInfoViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4 max-sm:flex-col max-sm:text-center">
        <Avatar className="size-20 shrink-0 border-2 border-border">
          {user?.pictureUrl && <AvatarImage src={user.pictureUrl} alt="Photo de profil" />}
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="size-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1 max-sm:items-center">
          <span className="text-lg font-semibold text-foreground">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-sm break-all text-muted-foreground">{user?.email}</span>
          <RoleBadge role={user?.role} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <InfoTile label="Prénom" value={user?.firstName || '-'} />
        <InfoTile label="Nom" value={user?.lastName || '-'} />
        <InfoTile label="Email" value={user?.email || '-'} />
        <InfoTile label="Rôle" value={user?.role?.nom || '-'} />
        <InfoTile label="Compte actif">
          <YesNoBadge value={user?.isActive} />
        </InfoTile>
        <InfoTile label="Email vérifié">
          <YesNoBadge value={user?.isMailVerified} />
        </InfoTile>
      </div>
    </div>
  )
}
