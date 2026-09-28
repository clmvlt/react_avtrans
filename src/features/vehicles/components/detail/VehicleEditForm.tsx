import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, Repeat } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
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

/** Taille maximale de la photo d'un véhicule. */
const MAX_PICTURE_SIZE = 10 * 1024 * 1024

type VehicleEditFormProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  /** Fin de l'édition (annulation ou sauvegarde réussie). */
  onDone: () => void
}

/**
 * Fiche du véhicule en mode édition (VehiculeInfoCard.vue, partie `isEditing`), à la place de la
 * fiche en lecture. Pas de `<form>` ni de soumission par Entrée, et pas de toast de succès, comme
 * le Vue. « Sauvegarder » reste désactivé tant que l'immatriculation, la marque ou le modèle sont
 * vides.
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
    updateVehicle.mutate(toUpdatePayload(values, picture, vehicule.relaiImmat ?? null), {
      onSuccess: onDone,
      onError: (err) => setError(getErrorMessage(err, 'Erreur lors de la sauvegarde')),
    })
  }

  return (
    <FormProvider {...form}>
      <section className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-foreground">Modifier le véhicule</h2>
          <p className="text-sm text-muted-foreground">
            Les champs marqués d&apos;un astérisque sont obligatoires.
          </p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <div className="flex items-center gap-4">
            <VehicleAvatarEditor
              pictureUrl={vehicule.pictureUrl}
              alt={vehicule.immat}
              preview={picture.pictureBase64}
              removed={picture.removePicture}
              onSelect={handlePictureSelect}
              onRemove={() => setPicture({ pictureBase64: null, removePicture: true })}
            />
            <VehicleTextField
              name="immat"
              label="Immatriculation *"
              uppercase
              placeholder="Immatriculation"
              className="min-w-0 flex-1"
              inputClassName="font-semibold tracking-wide uppercase"
            />
          </div>

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

          <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Repeat className="mt-0.5 size-3.5 shrink-0" />
            Véhicule relais (garage, panne…) : il se déclare depuis la fiche, carte « Véhicule
            relais », avec sa plaque, ses dates et son kilométrage.
          </p>

          <VehicleCommentField placeholder="Informations supplémentaires..." disabled={saving} />

          <VehicleExtraFields variant="card" disabled={saving} />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3 sm:px-5">
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
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </section>
    </FormProvider>
  )
}
