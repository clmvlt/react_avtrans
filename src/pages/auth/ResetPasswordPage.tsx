import { useSearchParams } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { BackToLoginLink } from '@/features/auth/components/BackToLoginLink'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  // Comme `route.query.token` du Vue : un seul paramètre, sinon considéré comme absent
  const tokens = searchParams.getAll('token')
  const token = tokens.length === 1 ? (tokens[0] ?? '') : ''

  return (
    <>
      <PageMeta
        title="Réinitialisation du mot de passe — AVTRANS Concept"
        robots="noindex, follow"
      />

      <AuthCard className="max-w-[480px]">
        <AuthHeader
          title="Réinitialiser le mot de passe"
          description="Entrez votre nouveau mot de passe."
        />
        <ResetPasswordForm token={token} />
        <BackToLoginLink />
      </AuthCard>
    </>
  )
}
