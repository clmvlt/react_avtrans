import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { GoogleRegisterForm } from '@/features/auth/components/GoogleRegisterForm'
import { GoogleRegisterPending } from '@/features/auth/components/GoogleRegisterPending'
import { clearRegistration, getRegistration } from '@/features/auth/lib/googleRegistration'

export default function GoogleRegisterPage() {
  const navigate = useNavigate()
  // Relais lu une fois au montage : il est vidé après la création, l'écran « Compte créé ! »
  // doit pourtant rester affiché
  const [registration] = useState(getRegistration)
  const [pendingMessage, setPendingMessage] = useState('')

  // Sans relais en mémoire (accès direct, rechargement), impossible de poursuivre : retour au
  // login, sans afficher le formulaire au préalable
  if (!registration) return <Navigate to="/login" replace />

  const goToLogin = () => {
    clearRegistration()
    navigate('/login')
  }

  return (
    <>
      <PageMeta title="Inscription avec Google — AVTRANS Concept" robots="noindex, follow" />

      <AuthCard className="max-w-[480px]">
        {pendingMessage ? (
          <GoogleRegisterPending message={pendingMessage} onGoToLogin={goToLogin} />
        ) : (
          <GoogleRegisterForm
            profile={registration.profile}
            onCreated={setPendingMessage}
            onCancel={goToLogin}
          />
        )}
      </AuthCard>
    </>
  )
}
