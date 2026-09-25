import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PaymentStatusBadgeProps = Omit<ComponentProps<typeof Badge>, 'variant' | 'children'> & {
  isPaid?: boolean
}

/** Badge de paiement d'un acompte : « Payé » (vert) ou « Non payé » (ambre). */
export function PaymentStatusBadge({ isPaid, className, ...props }: PaymentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        isPaid
          ? 'border-green-500/50 text-green-600 dark:text-green-400'
          : 'border-amber-500/50 text-amber-600 dark:text-amber-400',
        className,
      )}
      {...props}
    >
      {isPaid ? 'Payé' : 'Non payé'}
    </Badge>
  )
}
