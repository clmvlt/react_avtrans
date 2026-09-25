import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type ResponsiveFilterSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  /** Champs du panneau (placés dans un `<form>` : Entrée applique quand c'est possible). */
  children: ReactNode
  onApply: () => void
  onReset: () => void
}

/**
 * Panneau de filtres des pages « mes » (MyAbsences, MyAcomptes) : en bas de l'écran sous 640 px
 * (coins arrondis, marge de la zone sûre), à droite au-dessus. Pied « Réinitialiser » /
 * « Appliquer ». Les champs sont contrôlés par la page (pas de brouillon, comme le Vue) ; la page
 * ferme le panneau dans `onApply` / `onReset`.
 *
 * @example
 * <ResponsiveFilterSheet open={open} onOpenChange={setOpen} title="Filtrer mes absences"
 *   description="Limitez la liste à un type d'absence ou à une période." onApply={apply} onReset={reset}>
 *   …champs…
 * </ResponsiveFilterSheet>
 */
export function ResponsiveFilterSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onApply,
  onReset,
}: ResponsiveFilterSheetProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={isMobile ? 'rounded-t-2xl pb-[env(safe-area-inset-bottom)]' : undefined}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            onApply()
          }}
        >
          {children}
        </form>

        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={onReset}>
            Réinitialiser
          </Button>
          <Button type="button" className="flex-1 sm:flex-none" onClick={onApply}>
            Appliquer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
