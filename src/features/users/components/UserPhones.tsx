import { Phone, Smartphone } from 'lucide-react'
import type { UserDTO } from '@/models'
import { cn } from '@/lib/utils'

type UserPhonesProps = {
  user: Pick<UserDTO, 'telPersonnel' | 'telPro'>
  /** `row` : sur une ligne (tableau) ; `column` : l'un sous l'autre (cartes mobiles). */
  layout?: 'row' | 'column'
}

/** Liens `tel:` du téléphone personnel et du téléphone professionnel. */
export function UserPhones({ user, layout = 'row' }: UserPhonesProps) {
  if (!user.telPersonnel && !user.telPro) return null

  const column = layout === 'column'

  return (
    <div
      className={cn(
        'mt-1',
        column ? 'flex flex-col gap-0.5' : 'flex flex-wrap items-center gap-x-3 gap-y-0.5',
      )}
    >
      {user.telPersonnel && (
        <a
          href={`tel:${user.telPersonnel}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          title={column ? undefined : 'Téléphone personnel'}
        >
          <Smartphone className="size-3 shrink-0" />
          {user.telPersonnel}
        </a>
      )}
      {user.telPro && (
        <a
          href={`tel:${user.telPro}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          title={column ? undefined : 'Téléphone professionnel'}
        >
          <Phone className="size-3 shrink-0" />
          {user.telPro}
        </a>
      )}
    </div>
  )
}
