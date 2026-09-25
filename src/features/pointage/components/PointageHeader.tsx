import { Gauge } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import { Button } from '@/components/ui/button'

type PointageHeaderProps = {
  onOpenKilometrage: () => void
}

/** En-tête collant de la page : retour, titre, saisie du kilométrage (icône seule sur téléphone). */
export function PointageHeader({ onOpenKilometrage }: PointageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
        {/* Bug B-13 reproduit : sans page précédente, retour vers la landing publique */}
        <BackButton fallback="/" />
        <h1 className="flex-1 text-lg font-bold text-foreground sm:text-xl">Pointage</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Saisir le kilométrage"
          onClick={onOpenKilometrage}
        >
          <Gauge className="size-4" />
          <span className="max-sm:sr-only">Kilométrage</span>
        </Button>
      </div>
    </header>
  )
}
