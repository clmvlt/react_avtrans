import { useEffect, useEffectEvent } from 'react'

/** Ctrl + K (⌘ + K sur Mac) : ouvre le choix de l'employé depuis n'importe où dans la page. */
export function usePickerShortcut(onOpen: () => void) {
  const open = useEffectEvent(onOpen)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
