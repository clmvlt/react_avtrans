import { cn } from '@/lib/utils'
import { getProgressBarClass } from '../lib/contractFormat'

type ContractProgressBarProps = {
  /** Pourcentage de réalisation (barre plafonnée à 100 %). */
  percentage: number | null
  className?: string
}

/** Barre de réalisation colorée selon le seuil (vert ≥ 100 %, ambre ≥ 80 %, rouge sinon). */
export function ContractProgressBar({ percentage, className }: ContractProgressBarProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(percentage ?? 0, 100)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          getProgressBarClass(percentage),
        )}
        style={{ width: `${Math.min(percentage ?? 0, 100)}%` }}
      />
    </div>
  )
}
