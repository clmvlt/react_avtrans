import { CircleCheck, CircleX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type MailVerifiedBadgeProps = {
  verified?: boolean
  /** Libellé court du négatif (« Non », cartes mobiles) au lieu de « Non vérifié ». */
  short?: boolean
}

/** E-mail vérifié ou non. */
export function MailVerifiedBadge({ verified, short = false }: MailVerifiedBadgeProps) {
  return (
    <Badge variant={verified ? 'default' : 'destructive'} className="gap-1">
      {verified ? <CircleCheck className="size-3" /> : <CircleX className="size-3" />}
      {verified ? 'Vérifié' : short ? 'Non' : 'Non vérifié'}
    </Badge>
  )
}
