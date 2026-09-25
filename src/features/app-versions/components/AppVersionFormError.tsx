import { CircleAlert } from 'lucide-react'

type AppVersionFormErrorProps = {
  message: string
}

/** Encart d'erreur en tête des dialogs de création et de modification (comme le Vue). */
export function AppVersionFormError({ message }: AppVersionFormErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </div>
  )
}
