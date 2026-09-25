// Modifié (MIGRATION.md 4.2) : libellé d'accessibilité en français.
import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Chargement"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
