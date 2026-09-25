import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import faviconUrl from '@/assets/favicon.png'
import { NotificationsPopover } from '@/features/notifications/components/NotificationsPopover'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { MobileNavSheet } from './MobileNavSheet'
import { NavbarLinks } from './NavbarLinks'
import { UserMenu } from './UserMenu'

type NavbarProps = {
  /** Ouvre le dialog des nouveautés (menu de l'avatar ou pied du panneau latéral) */
  onShowChangelog: () => void
}

/**
 * Barre de navigation des pages protégées : logo vers la route par défaut, liens principaux
 * (autant qu'il en tient), cloche des notifications (à partir de sm), menu de l'avatar et
 * panneau latéral.
 */
export function Navbar({ onShowChangelog }: NavbarProps) {
  const user = useAuthStore((s) => s.user)
  const roleUuid = useAuthStore(selectRoleUuid)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  // Largeur de la zone gauche, suivie comme dans le Vue (ResizeObserver)
  const [availableWidth, setAvailableWidth] = useState(0)
  const measureLeftSection = (node: HTMLDivElement | null) => {
    if (!node) return
    setAvailableWidth(node.offsetWidth)
    const observer = new ResizeObserver(() => setAvailableWidth(node.offsetWidth))
    observer.observe(node)
    return () => observer.disconnect()
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 h-14 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone gauche : logo + liens */}
        <div
          ref={measureLeftSection}
          className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden"
        >
          <Link
            to={getDefaultRoute(roleUuid)}
            className="flex shrink-0 items-center gap-2.5 no-underline transition-opacity hover:opacity-80"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <img src={faviconUrl} alt="AVTRANS" className="size-7 rounded-md" />
            </div>
            <span className="hidden text-lg font-bold tracking-wide text-foreground md:inline">
              AVTRANS
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <NavbarLinks availableWidth={availableWidth} />
        </div>

        {/* Zone droite : notifications, avatar, menu */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden sm:block">
            <NotificationsPopover />
          </div>
          <UserMenu onShowChangelog={onShowChangelog} onLogout={handleLogout} />
          <MobileNavSheet onShowChangelog={onShowChangelog} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  )
}
