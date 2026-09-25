import { Checkbox } from '@/components/ui/checkbox'

type ApproveDirectlyFieldProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Ligne d'aide (« L'absence sera validée sans attente »…). */
  description: string
  disabled?: boolean
}

/**
 * Case « Approuver directement » des créations admin, en carte cliquable (règle UI du projet).
 * Réutilisée par la feature acomptes.
 */
export function ApproveDirectlyField({
  checked,
  onCheckedChange,
  description,
  disabled = false,
}: ApproveDirectlyFieldProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm leading-none font-medium">Approuver directement</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </label>
  )
}
