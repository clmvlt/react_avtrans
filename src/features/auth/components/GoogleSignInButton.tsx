import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GoogleCredentialResponse } from '@/types/google-identity'
import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from '../lib/googleIdentity'

type GoogleSignInButtonProps = {
  /** Texte du bouton Google */
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  /** Active le One Tap (prompt automatique) ; désactivé par défaut, comme dans le Vue */
  oneTap?: boolean
  /** Voile de chargement pendant l'appel API piloté par le parent */
  loading?: boolean
  /** ID token JWT Google (`response.credential`) */
  onCredential: (idToken: string) => void
  /** Erreur GIS (credential manquant) */
  onError: (message: string) => void
}

/**
 * Bouton officiel Google (Google Identity Services) rendu dans un conteneur.
 * Comme dans le Vue, le thème et la largeur sont figés au montage. L'effet vide le conteneur à
 * son nettoyage : sous StrictMode, le bouton n'est rendu qu'une fois.
 */
export function GoogleSignInButton({
  text = 'continue_with',
  oneTap = false,
  loading = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const unavailable = !GOOGLE_CLIENT_ID || loadFailed

  // Toujours les derniers callbacks du parent, sans réinitialiser GIS
  const handleCredential = useEffectEvent((response: GoogleCredentialResponse) => {
    if (!response?.credential) {
      onError('Aucun identifiant Google reçu. Veuillez réessayer.')
      return
    }
    onCredential(response.credential)
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID manquant — bouton Google désactivé.')
      return
    }

    const container = containerRef.current
    let cancelled = false

    loadGoogleIdentity()
      .then((googleId) => {
        if (cancelled || !container) return

        googleId.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleCredential(response),
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        })

        const isDark = document.documentElement.classList.contains('dark')
        const width = Math.min(container.offsetWidth || 360, 400)

        googleId.renderButton(container, {
          type: 'standard',
          theme: isDark ? 'filled_blue' : 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'center',
          width,
        })

        if (oneTap) googleId.prompt()
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadFailed(true)
        console.error('Google Identity Services:', err)
      })

    return () => {
      cancelled = true
      container?.replaceChildren()
    }
  }, [text, oneTap])

  return (
    <div className="relative w-full">
      {/* Conteneur du bouton officiel Google (rempli par GIS, jamais par React) */}
      <div
        ref={containerRef}
        className={cn('flex w-full justify-center', loading && 'pointer-events-none opacity-50')}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Repli si GIS ne peut pas être chargé (réseau, bloqueur) ou sans client ID */}
      {unavailable && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Connexion Google indisponible pour le moment.
        </p>
      )}
    </div>
  )
}
