import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

type EmptyBlockProps = ComponentProps<typeof Empty> & {
  icon: LucideIcon
  iconClassName?: string
}

/**
 * État vide des pages d'entretiens : icône au-dessus d'un texte, dans un cadre en pointillés, sur
 * la base de `Empty` de shadcn.
 */
export function EmptyBlock({
  icon: Icon,
  iconClassName,
  className,
  children,
  ...props
}: EmptyBlockProps) {
  return (
    <Empty
      className={cn('gap-4 rounded-xl border border-dashed p-0 py-16 md:p-0 md:py-16', className)}
      {...props}
    >
      <Icon className={cn('size-12 text-muted-foreground', iconClassName)} />
      {children}
    </Empty>
  )
}
