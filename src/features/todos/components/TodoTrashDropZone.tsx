import { useState, type AnimationEvent, type DragEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type TodoTrashDropZoneProps = {
  /** Une tâche est en cours de glisser-déposer. */
  visible: boolean
  /** La tâche survole la corbeille. */
  active: boolean
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
}

/**
 * Corbeille flottante en bas de l'écran pendant un glisser-déposer : entrée par le bas avec
 * rebond, sortie vers le bas (tw-animate-css). Les keyframes animent `transform` et le centrage
 * utilise la propriété `translate` : ils ne se cumulent plus comme dans le Vue (MIGRATION.md 8.1).
 */
export function TodoTrashDropZone({
  visible,
  active,
  onDragOver,
  onDragLeave,
  onDrop,
}: TodoTrashDropZoneProps) {
  // Reste monté pendant l'animation de sortie
  const [rendered, setRendered] = useState(visible)
  if (visible && !rendered) setRendered(true)

  if (!rendered) return null

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !visible) setRendered(false)
  }

  return (
    <div
      data-state={visible ? 'open' : 'closed'}
      className={cn(
        'fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3 rounded-xl border-3 border-dashed border-destructive bg-linear-to-br from-destructive/10 to-background px-8 py-6 shadow-2xl transition-all',
        'data-[state=open]:animate-in data-[state=open]:duration-400 data-[state=open]:ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-[150%]',
        'data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:ease-in data-[state=closed]:fade-out-0 data-[state=closed]:fill-mode-forwards data-[state=closed]:slide-out-to-bottom-[150%]',
        active && 'scale-105 border-solid from-destructive to-red-600',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onAnimationEnd={handleAnimationEnd}
    >
      <Trash2
        className={cn(
          'size-10 transition-colors',
          active ? 'animate-bounce text-white' : 'text-destructive',
        )}
      />
      <span
        className={cn(
          'text-sm font-semibold transition-colors',
          active ? 'text-white' : 'text-destructive',
        )}
      >
        Déposer pour supprimer
      </span>
    </div>
  )
}
