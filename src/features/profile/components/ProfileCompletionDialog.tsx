import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UpdateProfileRequest } from '@/models'
import { useAuthStore } from '@/stores/auth-store'
import { useUpdateProfileMutation } from '../api/useUpdateProfileMutation'
import {
  hasCompleteAddress,
  hasDriverLicense,
  selectNeedsProfileCompletion,
} from '../lib/profileCompletion'
import {
  profileCompletionSchema,
  type ProfileCompletionFormValues,
} from '../schemas/profileCompletion'
import { ProfileCompletionFields } from './ProfileCompletionFields'

/**
 * Dialog « Complétez votre profil » (ProfileCompletionDialog.vue + sa logique d'App.vue),
 * autonome : à monter une fois dans l'app authentifiée (GlobalDialogs), sans props.
 * - Il s'ouvre de lui-même à son montage (arrivée dans l'app, y compris juste après la connexion)
 *   si l'adresse (rue, ville, code postal) ou le numéro de permis manque, pour un compte vérifié
 *   et actif. « Plus tard » le ferme jusqu'à la prochaine arrivée.
 * - Il disparaît dès que le profil est complet (après l'enregistrement, `refreshUser`).
 * - Aucune validation, comme le Vue : des valeurs vides peuvent être enregistrées.
 */
export function ProfileCompletionDialog() {
  const needsCompletion = useAuthStore(selectNeedsProfileCompletion)
  // Évalué à l'arrivée seulement, comme le `onMounted` d'App.vue
  const [open, setOpen] = useState(needsCompletion)

  if (!needsCompletion) return null
  return <ProfileCompletionDialogContent open={open} onOpenChange={setOpen} />
}

type ProfileCompletionDialogContentProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ProfileCompletionDialogContent({
  open,
  onOpenChange,
}: ProfileCompletionDialogContentProps) {
  const user = useAuthStore((state) => state.user)
  const showDriverLicense = !hasDriverLicense(user)
  const showAddress = !hasCompleteAddress(user)
  const updateProfile = useUpdateProfileMutation()
  const saving = updateProfile.isPending
  const [error, setError] = useState('')

  // Pré-rempli avec les données existantes à l'ouverture
  const form = useForm<ProfileCompletionFormValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      driverLicenseNumber: user?.driverLicenseNumber || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'France',
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next && saving) return
    onOpenChange(next)
  }

  const onSubmit = async (values: ProfileCompletionFormValues) => {
    setError('')
    const data: UpdateProfileRequest = {}
    if (showAddress) {
      data.address = {
        street: values.street,
        city: values.city,
        postalCode: values.postalCode,
        country: values.country || 'France',
      }
    }
    if (showDriverLicense) data.driverLicenseNumber = values.driverLicenseNumber

    try {
      // Le dialog est retiré dès que le profil rafraîchi est complet : `mutateAsync` plutôt que
      // les callbacks de `mutate`, qui ne seraient plus appelés
      await updateProfile.mutateAsync(data)
      toast.success('Succès', { description: 'Profil mis à jour avec succès !' })
      onOpenChange(false)
    } catch (err) {
      setError((err instanceof Error && err.message) || 'Erreur lors de la mise à jour du profil')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-warning/10 text-warning">
              <TriangleAlert className="size-5" />
            </div>
            Complétez votre profil
          </DialogTitle>
          <DialogDescription>
            Certaines informations de votre profil sont manquantes. Veuillez renseigner votre
            adresse et votre numéro de permis de conduire.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <ProfileCompletionFields
            form={form}
            showDriverLicense={showDriverLicense}
            showAddress={showAddress}
            disabled={saving}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Plus tard
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
