import { PageMeta } from '@/components/shared/PageMeta'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { BackToLoginLink } from '@/features/auth/components/BackToLoginLink'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <>
      <PageMeta title="Mot de passe oublié — AVTRANS Concept" robots="noindex, follow" />

      <AuthCard>
        <AuthHeader
          title="Mot de passe oublié"
          description="Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
        />
        <ForgotPasswordForm />
        <BackToLoginLink />
      </AuthCard>
    </>
  )
}
