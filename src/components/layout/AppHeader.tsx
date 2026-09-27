import { Fragment } from 'react'
import { Eye, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import faviconUrl from '@/assets/favicon.png'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { NotificationsPopover } from '@/features/notifications/components/NotificationsPopover'
import { usePermissions } from '@/hooks/usePermissions'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { getRouteMeta } from '@/lib/routeMeta'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { MobileNavSheet } from './MobileNavSheet'

type AppHeaderProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * En-tête collant des pages protégées : fil d'Ariane sur ordinateur ; menu « hamburger » et logo
 * sur téléphone ; rappel de la vue utilisateur et cloche des notifications à droite.
 */
export function AppHeader({ onShowChangelog, onLogout }: AppHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const roleUuid = useAuthStore(selectRoleUuid)
  const { isViewingAsUser, toggleViewMode } = usePermissions()
  const meta = getRouteMeta(pathname)

  const crumbs = [
    meta?.section ? { label: meta.section } : null,
    meta?.parent ? { label: meta.parent.label, to: meta.parent.to } : null,
    meta ? { label: meta.title } : null,
  ].filter((crumb) => crumb !== null)

  const backToAdminView = () => {
    toggleViewMode()
    void navigate(getDefaultRoute(roleUuid))
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4 md:px-6 lg:px-8">
      <MobileNavSheet onShowChangelog={onShowChangelog} onLogout={onLogout} />

      {/* Téléphone : logo ; ordinateur : fil d'Ariane */}
      <Link to={getDefaultRoute(roleUuid)} className="flex items-center gap-2 md:hidden">
        <img src={faviconUrl} alt="" className="size-7 rounded-md" />
        <span className="font-bold tracking-wide">AVTRANS</span>
      </Link>
      <Breadcrumb className="min-w-0 max-md:hidden">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : 'to' in crumb && crumb.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="truncate">{crumb.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1.5">
        {isViewingAsUser && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
            title="Revenir à la vue admin"
            onClick={backToAdminView}
          >
            <Eye className="size-3.5" />
            <span className="max-sm:hidden">Vue utilisateur</span>
            <X className="size-3.5" />
          </Button>
        )}
        <NotificationsPopover />
      </div>
    </header>
  )
}
