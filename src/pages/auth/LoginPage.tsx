import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Link } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { Separator } from '@/components/ui/separator'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { HomeScreenPromptDialog } from '@/features/auth/components/HomeScreenPromptDialog'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { OrDivider } from '@/features/auth/components/OrDivider'
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn'
import { usePostLoginRedirect } from '@/features/auth/hooks/usePostLoginRedirect'

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const { redirectAfterLogin, homeScreenPrompt } = usePostLoginRedirect()
  const google = useGoogleSignIn({ onAuthenticated: redirectAfterLogin, onError: setErrorMessage })

  return (
    <>
      {/* Page indexable (voir robots.txt) : titre, description et canonique propres */}
      <PageMeta
        title="Connexion à l'espace employé — AVTRANS Concept"
        description="Connectez-vous à l'espace employé AVTRANS Concept : pointage, planning, absences et acomptes."
        canonicalPath="/login"
      />

      <AuthCard>
        <AuthHeader title="Connexion" />

        {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

        <LoginForm
          onSubmitStart={() => setErrorMessage('')}
          onError={setErrorMessage}
          onLoggedIn={redirectAfterLogin}
        />

        <OrDivider />

        <div className="mb-6">
          <GoogleSignInButton
            text="continue_with"
            loading={google.isPending}
            onCredential={(idToken) => {
              setErrorMessage('')
              google.signIn(idToken)
            }}
            onError={setErrorMessage}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            <KeyRound className="size-3.5" />
            Mot de passe oublié ?
          </Link>

          <Separator />

          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </AuthCard>

      <HomeScreenPromptDialog {...homeScreenPrompt} />
    </>
  )
}
