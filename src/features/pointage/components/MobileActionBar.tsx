import type { ReactNode } from 'react'

type MobileActionBarProps = {
  children: ReactNode
}

/**
 * Barre d'actions fixe en bas, sous `md` (zone du pouce). Le fond va jusqu'au bord de l'écran,
 * mais les boutons restent au-dessus de la zone système (barre de gestes, home indicator) :
 * - `px-4` + boutons `rounded-xl` : un coin d'écran arrondi ne les rogne pas ;
 * - `pb = max(1rem, inset + 0.5rem)` : plancher si le navigateur ne remonte aucun inset
 *   (`viewport-fit=cover` dans index.html, sinon `env()` vaut toujours 0).
 */
export function MobileActionBar({ children }: MobileActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-2.5 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto max-w-[1100px]">{children}</div>
    </div>
  )
}
