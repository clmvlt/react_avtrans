import { useState } from 'react'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChangePasswordForm } from './ChangePasswordForm'
import { ProfileSection } from './ProfileSection'

/** Section « Mot de passe » de /profile : changement du mot de passe. */
export function ChangePasswordCard() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <ProfileSection
      icon={Lock}
      title="Mot de passe"
      action={
        !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <KeyRound className="size-4" />
            Changer le mot de passe
          </Button>
        )
      }
    >
      {isEditing ? (
        <ChangePasswordForm onDone={() => setIsEditing(false)} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <ShieldCheck className="size-5 shrink-0 text-success" />
          <p className="text-sm text-muted-foreground">
            Votre mot de passe est sécurisé. Cliquez sur « Changer le mot de passe » pour le
            modifier.
          </p>
        </div>
      )}
    </ProfileSection>
  )
}
