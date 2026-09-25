import { ChangelogDialog } from '@/features/changelog/components/ChangelogDialog'
import { ProfileCompletionDialog } from '@/features/profile/components/ProfileCompletionDialog'
import { ServiceHistoryDialog } from '@/features/service-history/components/ServiceHistoryDialog'
import { SignatureReminderDialog } from '@/features/signatures/components/SignatureReminderDialog'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'

type GlobalDialogsProps = {
  changelogOpen: boolean
  onChangelogOpenChange: (open: boolean) => void
}

/**
 * Dialogs globaux de l'app authentifiée, montés par AppLayout (donc seulement sur les pages
 * protégées, y compris juste après la connexion : décision Q-GLOBALDIALOGS).
 */
export function GlobalDialogs({ changelogOpen, onChangelogOpenChange }: GlobalDialogsProps) {
  const isAdmin = useAuthStore(selectIsAdmin)

  return (
    <>
      {/* Nouveautés : ouvert automatiquement par AppLayout s'il y en a de non vues */}
      <ChangelogDialog open={changelogOpen} onOpenChange={onChangelogOpenChange} />

      {/* Complétion de profil : ouverte à l'arrivée si l'adresse ou le numéro de permis manque */}
      <ProfileCompletionDialog />

      {/* Rappel de signature des heures du mois dernier : bloquant, une fois par session */}
      <SignatureReminderDialog />

      {/* Historique d'un pointage (notifications, journal, pointages d'un employé) : admins */}
      {isAdmin && <ServiceHistoryDialog />}
    </>
  )
}
