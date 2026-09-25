import { useState } from 'react'
import { Pencil, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserDTO } from '@/models'
import { ProfileEditForm } from './ProfileEditForm'
import { ProfileInfoView } from './ProfileInfoView'
import { ProfileSection } from './ProfileSection'

type ProfileInfoCardProps = {
  user: UserDTO | null
}

/** Section « Informations personnelles » de /profile, en lecture ou en édition. */
export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <ProfileSection
      icon={User}
      title="Informations personnelles"
      action={
        !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="size-3.5" />
            Modifier
          </Button>
        )
      }
    >
      {isEditing ? (
        <ProfileEditForm user={user} onDone={() => setIsEditing(false)} />
      ) : (
        <ProfileInfoView user={user} />
      )}
    </ProfileSection>
  )
}
