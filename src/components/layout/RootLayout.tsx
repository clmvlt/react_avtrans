import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useNavigate } from 'react-router'
import { setUnauthorizedHandler } from '@/api'
import { useAuthStore } from '@/stores/auth-store'
import { UpdateBanner } from './UpdateBanner'

/**
 * Racine de toutes les routes (publiques et protégées).
 * Branche la déconnexion sur les 401 de l'API et restaure le défilement comme le router Vue
 * (position sauvegardée au retour arrière, sinon haut de page).
 */
export function RootLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login')) navigate('/login')
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  return (
    <>
      <Outlet />
      <UpdateBanner />
      <ScrollRestoration />
    </>
  )
}
