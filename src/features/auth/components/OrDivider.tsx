import { Separator } from '@/components/ui/separator'

/** Séparateur « ou » entre le formulaire et le bouton Google. */
export function OrDivider() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">ou</span>
      <Separator className="flex-1" />
    </div>
  )
}
