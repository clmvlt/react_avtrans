import { useState } from 'react'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChangePasswordForm } from './ChangePasswordForm'
import { ProfileSection } from './ProfileSection'

/** Section « Sécurité » de /profile : changement du mot de passe. */
export function ChangePasswordCard() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <ProfileSection
      icon={Lock}
      title="Sécurité"
      action={
        !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <KeyRound className="size-3.5" />
            Changer le mot de passe
          </Button>
        )
      }
    >
      {isEditing ? (
        <ChangePasswordForm onDone={() => setIsEditing(false)} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-md border bg-background p-4">
            <ShieldCheck className="size-6 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm text-muted-foreground">
              Votre mot de passe est sécurisé. Cliquez sur "Changer le mot de passe" pour le
              modifier.
            </p>
          </div>
        </div>
      )}
    </ProfileSection>
  )
}
