import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fileToDataUrl } from '@/lib/fileToDataUrl'
import type { VehiculeDTO } from '@/models'
import { useUpdateVehicleMutation } from '../../api/useUpdateVehicleMutation'
import { getErrorMessage } from '../../lib/errors'
import {
  toUpdatePayload,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormValues,
  type VehiclePictureEdit,
} from '../../schemas/vehicle'
import { FormErrorBanner } from '../FormErrorBanner'
import { VehicleCommentField } from '../forms/VehicleCommentField'
import { VehicleExtraFields } from '../forms/VehicleExtraFields'
import { VehicleTextField } from '../forms/VehicleTextField'
import { VehicleAvatarEditor } from './VehicleAvatarEditor'
import { VehicleInfoHeader } from './VehicleInfoHeader'

/** Taille maximale de la photo d'un véhicule. */
const MAX_PICTURE_SIZE = 10 * 1024 * 1024

type VehicleEditFormProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  /** Fin de l'édition (annulation ou sauvegarde réussie). */
  onDone: () => void
}

/**
 * Fiche du véhicule en mode édition (VehiculeInfoCard.vue, partie `isEditing`). Pas de `<form>` ni
 * de soumission par Entrée, et pas de toast de succès, comme le Vue. « Sauvegarder » reste
 * désactivé tant que l'immatriculation, la marque ou le modèle sont vides.
 */
export function VehicleEditForm({ vehicule, vehiculeId, onDone }: VehicleEditFormProps) {
  const updateVehicle = useUpdateVehicleMutation(vehiculeId)
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: vehicleToFormValues(vehicule),
    mode: 'onTouched',
  })
  const [picture, setPicture] = useState<VehiclePictureEdit>({
    pictureBase64: null,
    removePicture: false,
  })
  const [error, setError] = useState('')
  const saving = updateVehicle.isPending

  const handlePictureSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }
    if (file.size > MAX_PICTURE_SIZE) {
      setError("L'image est trop volumineuse (max 10MB)")
      return
    }
    setError('')
    fileToDataUrl(file).then(
      (pictureBase64) => setPicture({ pictureBase64, removePicture: false }),
      () => setError('Erreur lors de la lecture du fichier'),
    )
  }

  const onSubmit = (values: VehicleFormValues) => {
    setError('')
    updateVehicle.mutate(toUpdatePayload(values, picture), {
      onSuccess: onDone,
      onError: (err) => setError(getErrorMessage(err, 'Erreur lors de la sauvegarde')),
    })
  }

  return (
    <FormProvider {...form}>
      <div className="p-5">
        <VehicleInfoHeader vehicule={vehicule} vehiculeId={vehiculeId} isEditing canEdit={false} />

        <div className="flex items-center gap-4">
          <VehicleAvatarEditor
            pictureUrl={vehicule.pictureUrl}
            alt={vehicule.immat}
            preview={picture.pictureBase64}
            removed={picture.removePicture}
            onSelect={handlePictureSelect}
            onRemove={() => setPicture({ pictureBase64: null, removePicture: true })}
          />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <Controller
              name="immat"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    type="text"
                    placeholder="Immatriculation"
                    aria-label="Immatriculation"
                    aria-invalid={fieldState.invalid || undefined}
                    className="h-9 font-semibold tracking-wide uppercase"
                  />
                  {fieldState.error && (
                    <p role="alert" className="text-xs text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </div>

      <div className="border-t p-5">
        <div className="space-y-4">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <div className="grid gap-4 sm:grid-cols-2">
            <VehicleTextField
              name="brand"
              label="Marque *"
              placeholder="Marque"
              disabled={saving}
            />
            <VehicleTextField
              name="model"
              label="Modèle *"
              placeholder="Modèle"
              disabled={saving}
            />
          </div>

          <VehicleTextField
            name="relaiImmat"
            label="Immatriculation du véhicule relais"
            uppercase
            placeholder="AB-123-CD"
            disabled={saving}
            inputClassName="tracking-wide uppercase"
          />

          <VehicleCommentField placeholder="Informations supplémentaires..." disabled={saving} />

          <VehicleExtraFields variant="card" disabled={saving} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" disabled={saving} onClick={onDone}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!form.formState.isValid || saving}
              onClick={form.handleSubmit(onSubmit)}
            >
              {saving ? (
                <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 size-3.5" />
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
