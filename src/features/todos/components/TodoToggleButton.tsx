import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type TodoToggleButtonProps = {
  done: boolean
  disabled: boolean
  onToggle: () => void
}

/** Rond à cocher d'une tâche : vert plein avec coche si terminée, bordure grise sinon. */
export function TodoToggleButton({ done, disabled, onToggle }: TodoToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
        done
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-muted-foreground/40 text-transparent hover:border-primary hover:text-primary',
      )}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <Check className="size-3" />
    </button>
  )
}
