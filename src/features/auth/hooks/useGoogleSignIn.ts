import { useNavigate } from 'react-router'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { useGoogleSignInMutation } from '../api/useGoogleSignInMutation'
import { getGoogleErrorMessage } from '../lib/authErrors'
import { setRegistration } from '../lib/googleRegistration'

type UseGoogleSignInOptions = {
  /**
   * Après AUTHENTICATED (session déjà appliquée). Par défaut : route par défaut du rôle,
   * comme Register.vue ; Login y ajoute le prompt d'écran d'accueil sur mobile.
   */
  onAuthenticated?: () => void
  /** Message d'erreur à afficher dans la page */
  onError: (message: string) => void
}

/**
 * Orchestration de l'étape 1 Google partagée par Login et Register (useGoogleSignIn du Vue) :
 * - AUTHENTICATED → session appliquée, puis `onAuthenticated` ;
 * - NEEDS_REGISTRATION → relais en mémoire, puis /register/google ;
 * - sinon → message d'erreur.
 * Comme dans le Vue, aucun contrôle e-mail vérifié / compte actif n'est fait ici.
 */
export function useGoogleSignIn({ onAuthenticated, onError }: UseGoogleSignInOptions) {
  const navigate = useNavigate()
  const applySession = useAuthStore((s) => s.applySession)
  const mutation = useGoogleSignInMutation()

  const signIn = (idToken: string) => {
    mutation.mutate(idToken, {
      onSuccess: (response) => {
        if (response.status === 'AUTHENTICATED') {
          applySession(response)
          if (onAuthenticated) onAuthenticated()
          else navigate(getDefaultRoute(selectRoleUuid(useAuthStore.getState())))
          return
        }

        if (response.status === 'NEEDS_REGISTRATION' && response.googleProfile) {
          // Transmet idToken + profil à la page de création (relais non persisté)
          setRegistration(idToken, response.googleProfile)
          navigate('/register/google')
          return
        }

        onError(response.message || 'Réponse inattendue du serveur Google.')
      },
      onError: (error) => {
        onError(getGoogleErrorMessage(error, 'Erreur lors de la connexion avec Google.'))
      },
    })
  }

  return { signIn, isPending: mutation.isPending }
}
