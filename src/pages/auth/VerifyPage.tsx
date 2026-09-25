import { useSearchParams } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { useVerifyEmailQuery } from '@/features/auth/api/useVerifyEmailQuery'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { VerifyEmailStatus } from '@/features/auth/components/VerifyEmailStatus'
import { useRedirectAfter } from '@/features/auth/hooks/useRedirectAfter'
import { getErrorMessage } from '@/features/auth/lib/authErrors'

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  // Comme `route.query.token` du Vue : un seul paramètre, non vide
  const tokens = searchParams.getAll('token')
  const token = tokens.length === 1 && tokens[0] ? tokens[0] : null

  const verify = useVerifyEmailQuery(token)
  const verified = verify.data?.success === true

  // Redirection automatique vers la connexion 3 s après la vérification
  useRedirectAfter('/login', 3000, verified)

  return (
    <>
      <PageMeta title="Vérification de l'email — AVTRANS Concept" robots="noindex, follow" />

      <AuthCard className="max-w-[480px]">
        {!token ? (
          <VerifyEmailStatus status="error" message="Token de vérification manquant" />
        ) : verify.isPending ? (
          <VerifyEmailStatus status="loading" />
        ) : verify.isError ? (
          <VerifyEmailStatus
            status="error"
            message={getErrorMessage(verify.error, 'Token invalide ou expiré')}
          />
        ) : verified ? (
          <VerifyEmailStatus
            status="success"
            message={verify.data?.message || 'Votre email a été vérifié avec succès.'}
          />
        ) : (
          <VerifyEmailStatus status="empty" />
        )}
      </AuthCard>
    </>
  )
}
