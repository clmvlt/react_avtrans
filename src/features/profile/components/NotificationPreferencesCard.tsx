import { useState } from 'react'
import { Bell, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NOTIFICATION_PREFERENCE_FIELDS,
  getNotificationChannelLabel,
  type NotificationPreferencesValues,
} from '../lib/notificationChannels'
import { InfoTile } from './InfoTile'
import { NotificationPreferencesForm } from './NotificationPreferencesForm'
import { ProfileSection } from './ProfileSection'

type NotificationPreferencesCardProps = {
  preferences: NotificationPreferencesValues
}

/** Section « Préférences de notifications » de /profile, en lecture ou en édition. */
export function NotificationPreferencesCard({ preferences }: NotificationPreferencesCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <ProfileSection
      icon={Bell}
      title="Préférences de notifications"
      action={
        !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" />
            Modifier
          </Button>
        )
      }
    >
      {isEditing ? (
        <NotificationPreferencesForm preferences={preferences} onDone={() => setIsEditing(false)} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Vos préférences de notifications actuelles.
          </p>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {NOTIFICATION_PREFERENCE_FIELDS.map((preference) => (
              <InfoTile
                key={preference.key}
                label={preference.label}
                value={getNotificationChannelLabel(preferences[preference.key])}
              />
            ))}
          </div>
        </div>
      )}
    </ProfileSection>
  )
}
