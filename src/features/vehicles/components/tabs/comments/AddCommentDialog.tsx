import { useId, useRef, useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Check, LoaderCircle, MessageSquare, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { fileToDataUrl } from '@/lib/fileToDataUrl'
import { cn } from '@/lib/utils'
import { useCreateAdjustInfoMutation } from '../../../api/useCreateAdjustInfoMutation'
import { getErrorMessage } from '../../../lib/errors'
import { commentFormSchema, type CommentFormValues } from '../../../schemas/comment'
import { FormErrorBanner } from '../../FormErrorBanner'

type AddCommentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  /** Commentaire enregistré : la liste revient à la première page. */
  onAdded: () => void
}

/** « Ajouter un commentaire » (VehiculeDetail.vue:273) : texte obligatoire et photos facultatives. */
export function AddCommentDialog({
  open,
  onOpenChange,
  vehiculeId,
  onAdded,
}: AddCommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <AddCommentForm
          vehiculeId={vehiculeId}
          onAdded={onAdded}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type AddCommentFormProps = {
  vehiculeId: string
  onAdded: () => void
  onClose: () => void
}

/**
 * Photos : images uniquement (un fichier d'un autre type est signalé, les autres sont gardés),
 * sans limite de taille ni de nombre, envoyées en data-URL dans le même POST, comme le Vue.
 */
function AddCommentForm({ vehiculeId, onAdded, onClose }: AddCommentFormProps) {
  const commentId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createAdjustInfo = useCreateAdjustInfoMutation(vehiculeId)
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { comment: '' },
    mode: 'onTouched',
  })
  const [pictures, setPictures] = useState<string[]>([])
  const [error, setError] = useState('')
  const saving = createAdjustInfo.isPending

  const handlePicturesSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    // Permet de choisir à nouveau les mêmes fichiers
    event.target.value = ''
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner uniquement des images')
        continue
      }
      fileToDataUrl(file).then(
        (dataUrl) => setPictures((current) => [...current, dataUrl]),
        () => undefined,
      )
    }
  }

  const onSubmit = ({ comment }: CommentFormValues) => {
    setError('')
    createAdjustInfo.mutate(
      { comment, picturesB64: pictures.length > 0 ? pictures : undefined },
      {
        onSuccess: () => {
          onAdded()
          onClose()
        },
        onError: (err) => setError(getErrorMessage(err, "Erreur lors de l'ajout du commentaire")),
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare className="size-5" />
          </div>
          Ajouter un commentaire
        </DialogTitle>
        <DialogDescription className="sr-only">Formulaire d'ajout de commentaire</DialogDescription>
      </DialogHeader>

      {error && <FormErrorBanner>{error}</FormErrorBanner>}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="comment"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid || undefined}>
              <FieldLabel
                htmlFor={commentId}
                className={cn('text-sm font-medium', fieldState.invalid && 'text-destructive')}
              >
                Commentaire *
              </FieldLabel>
              <Textarea
                {...field}
                id={commentId}
                rows={4}
                placeholder="Entrez votre commentaire..."
                disabled={saving}
                aria-invalid={fieldState.invalid || undefined}
                className="field-sizing-fixed min-h-20 bg-background dark:bg-background"
              />
              <FieldError className="text-xs">{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Photos (optionnel)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            tabIndex={-1}
            onChange={handlePicturesSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 size-4" />
            Ajouter des photos
          </Button>
          {pictures.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {pictures.map((preview, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square overflow-hidden rounded-lg border">
                    <img src={preview} alt="Aperçu" className="size-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute -top-1.5 -right-1.5"
                    aria-label="Retirer la photo"
                    disabled={saving}
                    onClick={() =>
                      setPictures((current) => current.filter((_, position) => position !== index))
                    }
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || saving}>
            {saving ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="mr-2 size-4" />
            )}
            Enregistrer
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
