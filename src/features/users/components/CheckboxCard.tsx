import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

type CheckboxCardProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label: ReactNode
  description: ReactNode
}

/** Case à cocher de formulaire modal, en carte cliquable (règle UI de CLAUDE.md). */
export function CheckboxCard({
  checked,
  onCheckedChange,
  disabled,
  label,
  description,
}: CheckboxCardProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm leading-none font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </label>
  )
}
