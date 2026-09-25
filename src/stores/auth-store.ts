import { create } from 'zustand'
import { ApiError } from '@/api'
import { TOKEN_STORAGE_KEY } from '@/config/api'
import { USER_ROLE_UUIDS } from '@/enums'
import { queryClient } from '@/lib/queryClient'
import type { AuthUserDTO, UserDTO } from '@/models'
import { authService, profileService } from '@/services'

/** Clé localStorage de l'utilisateur, identique au Vue (le token est sous `auth_token`). */
const USER_STORAGE_KEY = 'user'

type AuthState = {
  user: UserDTO | null
  token: string | null
  /** Admin ou mécanicien affichant l'application comme un utilisateur (non persisté) */
  viewAsUser: boolean
  /** Applique une réponse d'authentification réussie (login ou Google) : state + localStorage */
  applySession: (response: { user?: AuthUserDTO; token?: string }) => void
  logout: () => void
  /** Rafraîchit l'utilisateur via GET /profile (401 → déconnexion ; réseau/timeout ignorés) */
  refreshUser: () => Promise<void>
  toggleViewMode: () => void
  setViewMode: (asUser: boolean) => void
}

/**
 * Hydratation manuelle depuis les clés du Vue (`auth_token` en texte brut, `user` en JSON).
 * Pas de middleware `persist` : il changerait le format et déconnecterait tout le monde
 * lors du passage du Vue au React.
 */
function readStoredSession(): Pick<AuthState, 'user' | 'token'> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (!token || !storedUser) return { user: null, token: null }
  try {
    return { user: JSON.parse(storedUser) as UserDTO, token }
  } catch (err) {
    console.error('Error loading user from storage:', err)
    authService.logout()
    localStorage.removeItem(USER_STORAGE_KEY)
    return { user: null, token: null }
  }
}

const canToggle = (user: UserDTO | null) => {
  const roleUuid = user?.role?.uuid
  return roleUuid === USER_ROLE_UUIDS.ADMINISTRATEUR || roleUuid === USER_ROLE_UUIDS.MECANICIEN
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...readStoredSession(),
  viewAsUser: false,

  applySession: (response) => {
    // Le service a déjà stocké le token ; il peut être dans `user` ou à la racine (compatibilité)
    const token = response.user?.token || response.token
    if (token && response.user) {
      set({ user: response.user, token })
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))
    }
  },

  logout: () => {
    set({ user: null, token: null, viewAsUser: false })
    authService.logout()
    localStorage.removeItem(USER_STORAGE_KEY)
    // Sans cela, les données du compte précédent resteraient en cache
    queryClient.clear()
  },

  refreshUser: async () => {
    const { token } = get()
    if (!token) return
    try {
      // GET /profile (et non /auth/me) : 401 propre si le token est invalide OU si le compte
      // a été désactivé. Le token opaque n'expire jamais : on le conserve tel quel.
      const profile = await profileService.getProfile()
      if (profile?.uuid) {
        const refreshed: AuthUserDTO = { ...profile, token }
        set({ user: refreshed })
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(refreshed))
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          get().logout()
        } else if (err.code !== 'NETWORK_ERROR' && err.code !== 'TIMEOUT') {
          console.error('Error refreshing user data:', err)
        }
        // Erreur réseau ou timeout (CORS, hors ligne) : on garde l'utilisateur en cache
      }
    }
  },

  toggleViewMode: () => {
    if (canToggle(get().user)) set((state) => ({ viewAsUser: !state.viewAsUser }))
  },

  setViewMode: (asUser) => {
    if (canToggle(get().user)) set({ viewAsUser: asUser })
  },
}))

// Sélecteurs (équivalents des getters du store Pinia)
export const selectIsAuthenticated = (s: AuthState) => !!s.token && !!s.user
export const selectIsEmailVerified = (s: AuthState) => s.user?.isMailVerified === true
export const selectIsActive = (s: AuthState) => s.user?.isActive === true
export const selectRoleUuid = (s: AuthState) => s.user?.role?.uuid ?? null
export const selectIsAdmin = (s: AuthState) => selectRoleUuid(s) === USER_ROLE_UUIDS.ADMINISTRATEUR
export const selectIsMechanic = (s: AuthState) => selectRoleUuid(s) === USER_ROLE_UUIDS.MECANICIEN
export const selectIsUser = (s: AuthState) => selectRoleUuid(s) === USER_ROLE_UUIDS.UTILISATEUR
export const selectCanToggleViewMode = (s: AuthState) => canToggle(s.user)
export const selectHasCouchettePermission = (s: AuthState) => s.user?.isCouchette === true
