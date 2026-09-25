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

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
