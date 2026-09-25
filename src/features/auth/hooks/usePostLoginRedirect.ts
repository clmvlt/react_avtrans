import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { isMobileDevice } from '../lib/browserDetection'

/**
 * Redirection après une connexion réussie sur /login (e-mail ou Google), comme Login.vue :
 * sur mobile, prompt « écran d'accueil » ; sinon, route par défaut du rôle.
 * À appeler une fois la session appliquée (le rôle est lu dans le store).
 */
export function usePostLoginRedirect() {
  const navigate = useNavigate()
  const [promptOpen, setPromptOpen] = useState(false)

  const goToDefaultRoute = () => {
    navigate(getDefaultRoute(selectRoleUuid(useAuthStore.getState())))
  }

  const redirectAfterLogin = () => {
    if (isMobileDevice()) setPromptOpen(true)
    else goToDefaultRoute()
  }

  return {
    redirectAfterLogin,
    /** Props de HomeScreenPromptDialog */
    homeScreenPrompt: {
      open: promptOpen,
      // Bug B-12 du Vue reproduit (MIGRATION.md 8.2) : fermer par l'overlay, Échap ou la croix
      // ne redirige pas (l'utilisateur reste sur /login, connecté)
      onOpenChange: setPromptOpen,
      // Bug B-11 du Vue reproduit (MIGRATION.md 8.2) : route inexistante, donc page 404
      onNavigate: () => navigate('/quick-login?setup=true'),
      onDismiss: goToDefaultRoute,
    },
  }
}
