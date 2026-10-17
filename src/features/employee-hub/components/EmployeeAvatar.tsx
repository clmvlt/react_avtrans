import type { ComponentProps } from 'react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { cn } from '@/lib/utils'
import type { Presence } from '../lib/employeeDirectory'
import { PRESENCE_DOT_CLASSES, PRESENCE_LABELS } from '../lib/presence'

type EmployeeAvatarProps = ComponentProps<typeof UserAvatar> & {
  presence: Presence
}

const DOT_SIZES = {
  sm: 'size-2.5',
  md: 'size-3',
  default: 'size-3',
  lg: 'size-3.5',
  xl: 'size-4',
} as const

/** Avatar d'un employé avec sa pastille de présence (qui pulse en service). */
export function EmployeeAvatar({
  presence,
  size = 'default',
  className,
  ...props
}: EmployeeAvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <UserAvatar size={size} {...props} />
      <span
        role="img"
        aria-label={PRESENCE_LABELS[presence]}
        className={cn(
          'absolute -right-0.5 -bottom-0.5 rounded-full border-2 border-card',
          DOT_SIZES[size],
          PRESENCE_DOT_CLASSES[presence],
        )}
      >
        {presence === 'PRESENT' && (
          <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
        )}
      </span>
    </span>
  )
}
