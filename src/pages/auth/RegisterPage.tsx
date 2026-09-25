import { useState } from 'react'
import { Link } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { OrDivider } from '@/features/auth/components/OrDivider'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { RegisterSuccess } from '@/features/auth/components/RegisterSuccess'
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn'

export default function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState('')
  /** Adresse du compte créé : non nulle une fois l'inscription réussie */
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  // Compte Google existant : route par défaut du rôle, sans prompt d'écran d'accueil (comme le Vue)
  const google = useGoogleSignIn({ onError: setErrorMessage })

  return (
    <>
      <PageMeta title="Inscription — AVTRANS Concept" robots="noindex, follow" />

      <AuthCard className="max-w-[520px]">
        <AuthHeader
          title="Inscription"
          description="Créez votre compte pour accéder à l'application de pointage"
        />

        {registeredEmail !== null && <RegisterSuccess email={registeredEmail} />}

        {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

        {registeredEmail === null && (
          <>
            <RegisterForm
              onSubmitStart={() => setErrorMessage('')}
              onError={setErrorMessage}
              onRegistered={setRegisteredEmail}
            />

            <OrDivider />

            <div className="mb-6">
              <GoogleSignInButton
                text="signup_with"
                loading={google.isPending}
                onCredential={(idToken) => {
                  setErrorMessage('')
                  google.signIn(idToken)
                }}
                onError={setErrorMessage}
              />
            </div>

            <div className="border-t border-border pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </>
        )}
      </AuthCard>
    </>
  )
}
