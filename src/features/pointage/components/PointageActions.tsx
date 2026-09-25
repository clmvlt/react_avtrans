import { LoaderCircle, Pause, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PointageStatus } from '../lib/pointageStatus'

type PointageActionsProps = {
  status: PointageStatus
  loading?: boolean
  /** `row` : boutons côte à côte, libellés courts. `column` : empilés, libellés longs. */
  layout?: 'row' | 'column'
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onEnd: () => void
}

const actionButtonClassName = 'h-14 flex-1 rounded-xl text-base font-semibold'
const solidClassName = 'text-white shadow-sm'

/** Boutons de pointage selon l'état (PointageActions.vue). */
export function PointageActions({
  status,
  loading = false,
  layout = 'column',
  onStart,
  onPause,
  onResume,
  onEnd,
}: PointageActionsProps) {
  const spinner = <LoaderCircle className="size-5 animate-spin" />

  return (
    <div className={layout === 'row' ? 'flex gap-2' : 'flex flex-col gap-3'}>
      {status === 'off' && (
        <Button
          type="button"
          className={cn(actionButtonClassName, solidClassName, 'bg-green-600 hover:bg-green-700')}
          disabled={loading}
          onClick={onStart}
        >
          {loading ? spinner : <Play className="size-5" />}
          Démarrer le service
        </Button>
      )}

      {status === 'working' && (
        <>
          <Button
            type="button"
            variant="outline"
            className={cn(
              actionButtonClassName,
              'border-amber-500/60 bg-amber-500/5 text-amber-700 hover:bg-amber-500/15 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300',
            )}
            disabled={loading}
            onClick={onPause}
          >
            {loading ? spinner : <Pause className="size-5" />}
            {layout === 'row' ? 'Pause' : 'Commencer une pause'}
          </Button>
          <Button
            type="button"
            className={cn(actionButtonClassName, solidClassName, 'bg-rose-600 hover:bg-rose-700')}
            disabled={loading}
            onClick={onEnd}
          >
            {loading ? spinner : <Square className="size-5" />}
            {layout === 'row' ? 'Terminer' : 'Terminer le service'}
          </Button>
        </>
      )}

      {status === 'break' && (
        <Button
          type="button"
          className={cn(actionButtonClassName, solidClassName, 'bg-green-600 hover:bg-green-700')}
          disabled={loading}
          onClick={onResume}
        >
          {loading ? spinner : <Play className="size-5" />}
          Reprendre le service
        </Button>
      )}
    </div>
  )
}
