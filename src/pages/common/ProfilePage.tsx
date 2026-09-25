import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useProfileQuery } from '@/features/profile/api/useProfileQuery'
import { ChangePasswordCard } from '@/features/profile/components/ChangePasswordCard'
import { NotificationPreferencesCard } from '@/features/profile/components/NotificationPreferencesCard'
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard'
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton'
import { useNotificationPreferences } from '@/features/profile/hooks/useNotificationPreferences'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'

/**
 * /profile : informations personnelles, préférences de notifications, mot de passe.
 * Chaque section passe seule de la lecture à l'édition, comme dans le Vue.
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore(selectIsAdmin)
  const profileQuery = useProfileQuery()
  const preferences = useNotificationPreferences(profileQuery.data)

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-6">
        <div className="mx-auto max-w-3xl">
          {profileQuery.isPending ? (
            <ProfileSkeleton />
          ) : profileQuery.isError ? (
            <ErrorState
              error={profileQuery.error}
              onRetry={() => void profileQuery.refetch()}
              isRetrying={profileQuery.isRefetching}
            />
          ) : (
            <div className="space-y-6">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4" />
                Retour
              </Button>

              <ProfileInfoCard user={profileQuery.data} />
              <NotificationPreferencesCard preferences={preferences} isAdmin={isAdmin} />
              <ChangePasswordCard />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
