import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

/** Lien « Retour à la connexion » en bas des pages mot de passe oublié / réinitialisation. */
export function BackToLoginLink() {
  return (
    <div className="text-center">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Retour à la connexion
      </Link>
    </div>
  )
}
