import { useEffect } from 'react'
import { useNavigate } from 'react-router'

/**
 * Redirige vers `to` après `delayMs` quand `enabled` devient vrai (Verify, ResetPassword).
 * Le minuteur est annulé si l'on quitte la page avant (le Vue ne le nettoyait pas).
 */
export function useRedirectAfter(to: string, delayMs: number, enabled: boolean) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled) return
    const timer = window.setTimeout(() => navigate(to), delayMs)
    return () => window.clearTimeout(timer)
  }, [enabled, to, delayMs, navigate])
}
