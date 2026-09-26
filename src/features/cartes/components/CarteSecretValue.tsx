import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CarteSecretValueProps = {
  /** Valeur affichée (déjà masquée ou en clair). */
  value: string
  /** État de l'œil (révélé ou non). */
  revealed: boolean
  /** Bouton œil affiché (le code n'en a pas quand il est vide). */
  showToggle?: boolean
  onToggle: () => void
  /** Libellé accessible du bouton (« numéro », « code »). */
  secretLabel: string
  /** Version des cartes mobiles : plus petite, sans info-bulle. */
  compact?: boolean
}

/** Numéro ou code PIN d'une carte, masqué, avec le bouton œil Afficher / Masquer. */
export function CarteSecretValue({
  value,
  revealed,
  showToggle = true,
  onToggle,
  secretLabel,
  compact = false,
}: CarteSecretValueProps) {
  const Icon = revealed ? EyeOff : Eye
  const actionLabel = revealed ? 'Masquer' : 'Afficher'

  return (
    <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
      <code
        className={cn(
          'rounded bg-muted px-2 font-mono text-foreground',
          compact ? 'py-0.5 text-xs' : 'py-1 text-sm',
        )}
      >
        {value}
      </code>
      {showToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title={compact ? undefined : actionLabel}
          aria-label={`${actionLabel} le ${secretLabel}`}
          onClick={onToggle}
        >
          <Icon className={compact ? 'size-3' : 'size-3.5'} />
        </Button>
      )}
    </div>
  )
}
