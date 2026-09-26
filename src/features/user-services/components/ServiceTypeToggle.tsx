import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type ServiceTypeToggleProps = {
  isBreak: boolean
  onChange: (isBreak: boolean) => void
  /** Modification : type affiché en lecture seule */
  readOnly?: boolean
}

/** Choix Service / Pause d'un nouveau pointage (lecture seule en modification). */
export function ServiceTypeToggle({ isBreak, onChange, readOnly = false }: ServiceTypeToggleProps) {
  if (readOnly) {
    const Icon = isBreak ? Pause : Play
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5">
        <Icon className={cn('size-4', isBreak ? 'text-amber-500' : 'text-green-500')} />
        <span
          className={cn(
            'text-sm font-medium',
            isBreak ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400',
          )}
        >
          {isBreak ? 'Pause' : 'Service'}
        </span>
      </div>
    )
  }

  const option =
    'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all'

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1" role="group" aria-label="Type">
      <button
        type="button"
        aria-pressed={!isBreak}
        className={cn(
          option,
          !isBreak
            ? 'bg-background text-green-600 shadow-sm dark:text-green-400'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange(false)}
      >
        <Play className="size-4" />
        Service
      </button>
      <button
        type="button"
        aria-pressed={isBreak}
        className={cn(
          option,
          isBreak
            ? 'bg-background text-amber-600 shadow-sm dark:text-amber-400'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange(true)}
      >
        <Pause className="size-4" />
        Pause
      </button>
    </div>
  )
}
