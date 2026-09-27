import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
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
  const isAdmin = useAuthStore(selectIsAdmin)
  const profileQuery = useProfileQuery()
  const preferences = useNotificationPreferences(profileQuery.data)

  return (
    <PageContainer size="sm">
      <PageHeader
        title="Mon profil"
        description="Vos informations personnelles, votre adresse et votre mot de passe."
      />

      <div>
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
            <ProfileInfoCard user={profileQuery.data} />
            <NotificationPreferencesCard preferences={preferences} isAdmin={isAdmin} />
            <ChangePasswordCard />
          </div>
        )}
      </div>
    </PageContainer>
  )
}
