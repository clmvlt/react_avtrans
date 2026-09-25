import { useLocalStorage } from '@/hooks/useLocalStorage'

/** Clé localStorage identique au Vue ('true' | 'false', absente = son activé) */
const SOUND_ENABLED_KEY = 'notifications_sound_enabled'
const SOUND_URL = '/sounds/notif.wav'

let audio: HTMLAudioElement | null = null

/** Joue le son de notification (échec silencieux tant que l'utilisateur n'a pas interagi). */
function playSound(): void {
  try {
    if (!audio) {
      audio = new Audio(SOUND_URL)
      audio.volume = 0.5
    }
    audio.currentTime = 0
    audio.play().catch(() => {
      // L'utilisateur n'a pas encore interagi avec la page : ignoré
    })
  } catch {
    // Lecture audio indisponible : ignoré
  }
}

/** Préférence « son des notifications » (bouton du popover) et lecture du son. */
export function useNotificationSound() {
  const [stored, setStored] = useLocalStorage(SOUND_ENABLED_KEY)
  const soundEnabled = stored === null ? true : stored === 'true'

  return {
    soundEnabled,
    toggleSound: () => setStored(String(!soundEnabled)),
    /** Joue le son si la préférence l'autorise */
    playSound: () => {
      if (soundEnabled) playSound()
    },
  }
}
