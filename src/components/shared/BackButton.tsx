import type { ComponentProps, MouseEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BackButtonProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size' | 'children'> & {
  /** Destination quand il n'y a pas de page précédente dans l'app (`'/'` par défaut, comme le Vue). */
  fallback?: string
  size?: 'sm' | 'default' | 'lg' | 'icon'
}

/**
 * Bouton « Retour » (port de `Retour.vue`) : page précédente de l'historique de l'app s'il y en a
 * une (`window.history.state.idx > 0`, clé de React Router), sinon `fallback`.
 * En taille `icon`, seul le chevron est affiché (libellé accessible « Retour »).
 *
 * Le défaut `fallback="/"` (landing publique) est conservé tel quel : bug B-13, non autorisé.
 *
 * @example <BackButton fallback="/" />
 */
export function BackButton({
  fallback = '/',
  size = 'default',
  className,
  onClick,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const state: unknown = window.history.state
    const index =
      state && typeof state === 'object' && 'idx' in state && typeof state.idx === 'number'
        ? state.idx
        : 0
    if (index > 0) void navigate(-1)
    else void navigate(fallback)
    onClick?.(event)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label="Retour"
      className={cn('gap-2', className)}
      onClick={handleClick}
      {...props}
    >
      <ChevronLeft className="size-4" />
      {size !== 'icon' && <span>Retour</span>}
    </Button>
  )
}
