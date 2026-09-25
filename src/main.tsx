import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { AppProviders } from '@/providers/AppProviders'
import { router } from '@/router/routes'
import { useAuthStore } from '@/stores/auth-store'

// Session restaurée depuis le localStorage : on rafraîchit l'utilisateur en arrière-plan
// (GET /profile), sans bloquer le rendu, comme le store Pinia au démarrage.
void useAuthStore.getState().refreshUser()

function render() {
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

// On attend que la première route (page lazy, loaders) soit prête avant de monter React :
// createRoot vide #app, qui contient la landing pré-rendue sur « / » ; monter plus tôt
// afficherait une page blanche le temps de charger le fichier JS de la page.
if (router.state.initialized) {
  render()
} else {
  const unsubscribe = router.subscribe((state) => {
    if (!state.initialized) return
    unsubscribe()
    render()
  })
}
