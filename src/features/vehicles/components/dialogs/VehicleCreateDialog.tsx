import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
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
import { fileToDataUrl } from '@/lib/fileToDataUrl'
import { useCreateVehicleMutation } from '../../api/useCreateVehicleMutation'
import { getErrorMessage } from '../../lib/errors'
import {
  EMPTY_VEHICLE_FORM,
  toCreatePayload,
  vehicleFormSchema,
  type VehicleFormValues,
} from '../../schemas/vehicle'
import { FormErrorBanner } from '../FormErrorBanner'
import { VehicleCommentField } from '../forms/VehicleCommentField'
import { VehicleExtraFields } from '../forms/VehicleExtraFields'
import { VehiclePictureInput } from '../forms/VehiclePictureInput'
import { VehicleTextField } from '../forms/VehicleTextField'

/** Taille maximale de la photo d'un véhicule. */
const MAX_PICTURE_SIZE = 10 * 1024 * 1024

type VehicleCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Dialog « Nouveau véhicule » (Vehicules.vue:244). Le formulaire repart de zéro à chaque ouverture. */
export function VehicleCreateDialog({ open, onOpenChange }: VehicleCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <VehicleCreateForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

type VehicleCreateFormProps = {
  onClose: () => void
}

/**
 * Comme le Vue, « Enregistrer » est désactivé tant que l'immatriculation, la marque ou le modèle
 * sont vides, et Entrée ne soumet pas (le bouton était hors du `<form>`).
 */
function VehicleCreateForm({ onClose }: VehicleCreateFormProps) {
  const createVehicle = useCreateVehicleMutation()
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: EMPTY_VEHICLE_FORM,
    mode: 'onTouched',
  })
  const [picture, setPicture] = useState('')
  const [error, setError] = useState('')
  const saving = createVehicle.isPending

  const handlePictureSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }
    if (file.size > MAX_PICTURE_SIZE) {
      setError("L'image est trop volumineuse (max 10MB)")
      return
    }
    // Échec de lecture silencieux, comme le Vue (pas de gestionnaire `onerror` à la création)
    fileToDataUrl(file).then(setPicture, () => undefined)
  }

  const onSubmit = (values: VehicleFormValues) => {
    setError('')
    createVehicle.mutate(toCreatePayload(values, picture), {
      onSuccess: () => {
        onClose()
        toast.success('Succès', { description: 'Véhicule créé avec succès !' })
      },
      onError: (err) => setError(getErrorMessage(err, "Erreur lors de l'enregistrement")),
    })
  }

  return (
    <FormProvider {...form}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Plus className="size-5" />
          </div>
          Nouveau véhicule
        </DialogTitle>
        <DialogDescription className="sr-only">
          Formulaire de création d'un véhicule
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {error && <FormErrorBanner>{error}</FormErrorBanner>}

        <VehicleTextField
          name="immat"
          label="Immatriculation *"
          uppercase
          placeholder="AB-123-CD"
          disabled={saving}
          inputClassName="tracking-wide uppercase"
        />

        <div className="grid grid-cols-2 gap-4">
          <VehicleTextField name="brand" label="Marque *" placeholder="Ford" disabled={saving} />
          <VehicleTextField name="model" label="Modèle *" placeholder="Transit" disabled={saving} />
        </div>

        <VehicleCommentField
          placeholder="Informations supplémentaires sur le véhicule..."
          disabled={saving}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Photo du véhicule</p>
          <div className="flex justify-center">
            <VehiclePictureInput
              preview={picture}
              disabled={saving}
              onSelect={handlePictureSelect}
              onClear={() => setPicture('')}
            />
          </div>
        </div>

        <VehicleExtraFields variant="dialog" disabled={saving} />
      </div>

      {/* `sm:gap-0` du Vue conservé : les deux boutons sont collés en desktop (Vehicules.vue:475) */}
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="button"
          disabled={!form.formState.isValid || saving}
          onClick={form.handleSubmit(onSubmit)}
        >
          {saving && <LoaderCircle className="mr-1.5 size-4 animate-spin" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </FormProvider>
  )
}
